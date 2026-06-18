import { Module } from '@nestjs/common';
import { AsistenciasController } from './asistencias.controller';
import { AsistenciasService } from './asistencias.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
})
export class AsistenciasModule {}
