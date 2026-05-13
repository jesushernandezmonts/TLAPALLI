import { Module } from '@nestjs/common';
import { TalleresController } from './talleres.controller';
import { TalleresService } from './talleres.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TalleresController],
  providers: [TalleresService]
})
export class TalleresModule {}
