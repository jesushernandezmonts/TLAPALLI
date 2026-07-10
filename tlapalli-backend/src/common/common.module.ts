import { Global, Module } from '@nestjs/common';
import { AppLogger } from './logger/logger.service';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class CommonModule {}
