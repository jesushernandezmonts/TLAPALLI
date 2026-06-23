import { Module } from '@nestjs/common';
import { ServicioSocialService } from './servicio-social.service';
import { ServicioSocialController } from './servicio-social.controller';

@Module({
  controllers: [ServicioSocialController],
  providers: [ServicioSocialService],
  exports: [ServicioSocialService],
})
export class ServicioSocialModule {}
