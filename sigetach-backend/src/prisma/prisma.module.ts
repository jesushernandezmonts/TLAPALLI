import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Lo hace disponible en todos los módulos sin necesidad de importarlo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
