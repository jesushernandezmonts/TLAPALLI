import { Injectable, Logger, LoggerService as NestLoggerService, Optional, Inject } from '@nestjs/common';

@Injectable()
export class AppLogger implements NestLoggerService {
  private readonly logger: Logger;

  constructor(@Optional() @Inject('LOGGER_CONTEXT') context?: string) {
    this.logger = new Logger(context || 'Tlapalli');
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
  }

  // Métodos específicos de la aplicación

  info(message: string, context?: string) {
    this.logger.log(`ℹ️ ${message}`, context);
  }

  success(message: string, context?: string) {
    this.logger.log(`✅ ${message}`, context);
  }

  security(message: string, context?: string) {
    this.logger.warn(`🔒 ${message}`, context);
  }

  email(message: string, context?: string) {
    this.logger.log(`📧 ${message}`, context);
  }

  db(message: string, context?: string) {
    this.logger.log(`🗄️ ${message}`, context);
  }

  http(message: string, context?: string) {
    this.logger.log(`🌐 ${message}`, context);
  }

  startup(message: string, context?: string) {
    this.logger.log(`🚀 ${message}`, context);
  }
}

// Factory para crear loggers con contexto
export function createLogger(context: string): AppLogger {
  return new AppLogger(context);
}
