import { Module } from '@nestjs/common';
import { ServicioSocialService } from './servicio-social.service';
import { ServicioSocialController } from './servicio-social.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [ServicioSocialController],
  providers: [ServicioSocialService],
  exports: [ServicioSocialService],
})
export class ServicioSocialModule {}
