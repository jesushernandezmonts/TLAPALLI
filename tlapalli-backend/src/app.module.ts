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
  ],
})
export class AppModule {}
