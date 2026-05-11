import { Module } from '@nestjs/common';
import { TalleresController } from './talleres.controller';
import { TalleresService } from './talleres.service';

@Module({
  controllers: [TalleresController],
  providers: [TalleresService]
})
export class TalleresModule {}
