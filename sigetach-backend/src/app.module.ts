import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { InstructoresModule } from './instructores/instructores.module';
import { TalleresModule } from './talleres/talleres.module';
import { InscripcionesModule } from './inscripciones/inscripciones.module';

@Module({
  imports: [AuthModule, PrismaModule, AlumnosModule, InstructoresModule, TalleresModule, InscripcionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
