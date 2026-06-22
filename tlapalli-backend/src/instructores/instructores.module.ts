import { Module } from '@nestjs/common';
import { InstructoresController } from './instructores.controller';
import { InstructoresService } from './instructores.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstructoresController],
  providers: [InstructoresService],
})
export class InstructoresModule {}
