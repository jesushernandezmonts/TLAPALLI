import { Module } from '@nestjs/common';
import { TalleresController } from './talleres.controller';
import { TalleresService } from './talleres.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, GatewayModule],
  controllers: [TalleresController],
  providers: [TalleresService]
})
export class TalleresModule {}
