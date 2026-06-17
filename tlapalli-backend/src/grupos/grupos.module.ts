import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GruposController],
  providers: [GruposService],
  exports: [GruposService],
})
export class GruposModule {}
