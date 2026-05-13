import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Cookie parser
  app.use(cookieParser());

  // Helmet (cabeceras HTTP seguras)
  app.use(helmet());

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

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('TLAPALLI API')
    .setDescription('API para gestión de centro cultural')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🚀 Servidor corriendo en http://localhost:3000');
}
bootstrap();
