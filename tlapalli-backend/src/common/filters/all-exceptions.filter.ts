import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Error interno del servidor';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // Tomar el mensaje de la respuesta de la excepción
        const resp = exceptionResponse as any;
        message = resp.message || resp.error || 'Error';
        // Si message es un array (errores de validación), unirlos
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
        errorName = resp.error || exception.name;
      }

      // Logging específico por tipo de error
      if (status === HttpStatus.UNAUTHORIZED) {
        this.logger.warn(`🔒 No autorizado: ${request.method} ${request.url} - ${message}`);
      } else if (status === HttpStatus.FORBIDDEN) {
        this.logger.warn(`🚫 Prohibido: ${request.method} ${request.url} - ${message}`);
      } else if (status === HttpStatus.TOO_MANY_REQUESTS) {
        this.logger.warn(`⏱️ Rate limit: ${request.method} ${request.url} - ${message}`);
      } else if (status === HttpStatus.BAD_REQUEST) {
        this.logger.warn(`⚠️ Bad request: ${request.method} ${request.url} - ${message}`);
      } else if (status >= 500) {
        this.logger.error(`❌ ${status} en ${request.method} ${request.url}: ${message}`, exception.stack);
        if (process.env.SENTRY_DSN) {
          Sentry.captureException(exception);
        }
      }
    } else if (exception instanceof Error) {
      // Errores no HTTP
      message = process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : exception.message;
      this.logger.error(`💥 Error no manejado: ${request.method} ${request.url} - ${exception.message}`, exception.stack);
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception);
      }
    }

    // Construir respuesta de error estandarizada
    const errorResponse = {
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Solo incluir stack trace en desarrollo
      ...(process.env.NODE_ENV !== 'production' && exception instanceof Error && { stack: exception.stack?.split('\n').slice(0, 5).join('\n') }),
    };

    response.status(status).json(errorResponse);
  }
}

