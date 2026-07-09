import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AlumnosController } from './alumnos.controller';
import { AlumnosService } from './alumnos.service';

@Module({
  imports: [AuthModule],
  controllers: [AlumnosController],
  providers: [AlumnosService],
  exports: [AlumnosService],
})
export class AlumnosModule {}
