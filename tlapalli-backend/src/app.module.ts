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
import { StatsModule } from './stats/stats.module';
import { PagosModule } from './pagos/pagos.module';
import { ActividadesModule } from './actividades/actividades.module';
import { ReportesModule } from './reportes/reportes.module';
import { GruposModule } from './grupos/grupos.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { ServicioSocialModule } from './servicio-social/servicio-social.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GatewayModule } from './gateway/gateway.module';
import { CommonModule } from './common/common.module';
import { HealthController } from './health/health.controller';


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
    StatsModule,
    PagosModule,
    ActividadesModule,
    ReportesModule,
    GruposModule,
    AsistenciasModule,
    ServicioSocialModule,
    CloudinaryModule,
    GatewayModule,
    CommonModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
