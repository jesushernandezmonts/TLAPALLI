import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const logger = new Logger('Bootstrap');

// Variables de entorno REQUERIDAS en producción
const REQUIRED_ENV_VARS_PRODUCTION = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
];

function validateEnv() {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS_PRODUCTION) {
    if (!process.env[envVar] || process.env[envVar].includes('tu-') || process.env[envVar].includes('cambiar-')) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    logger.error('❌ Variables de entorno faltantes o con valores placeholder:');
    missing.forEach(v => logger.error(`   - ${v}`));
    logger.error('El servidor no puede iniciar. Revisa tu archivo .env o secrets de producción.');
    process.exit(1);
  }

  logger.log('✅ Variables de entorno validadas correctamente');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ===== VALIDACIÓN DE ENTORNO =====
  if (process.env.NODE_ENV === 'production') {
    validateEnv();
  }

  // ===== SEGURIDAD =====
  // Helmet (cabeceras HTTP seguras)
  app.use(helmet({ crossOriginEmbedderPolicy: false }));

  // Rate limiting global (100 peticiones por minuto por IP)
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 100,
      message: { message: 'Demasiadas peticiones, intente de nuevo en un minuto' },
    }),
  );

  // Rate limiting específico para login (5 intentos por minuto)
  app.use('/auth/login', rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: 'Demasiados intentos de login, intente de nuevo en un minuto' },
  }));

  // ===== CONFIGURACIÓN GENERAL =====
  // Cookie parser
  app.use(cookieParser());

  // Trust proxy para que Koyeb/Render/reverse proxies funcionen con rate limiting
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // ===== SWAGGER =====
  const config = new DocumentBuilder()
    .setTitle('TLAPALLI API')
    .setDescription('API para gestión de centro cultural Tlapalli - Huamantla')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ===== INICIO =====
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
