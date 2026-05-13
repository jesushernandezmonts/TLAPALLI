import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { InstructoresModule } from './instructores/instructores.module';
import { TalleresModule } from './talleres/talleres.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';
import { DocumentosModule } from './documentos/documentos.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AlumnosModule,
    InstructoresModule,
    TalleresModule,
    InscripcionesModule,
    DocumentosModule,
    MailModule,
  ],
})
export class AppModule {}
