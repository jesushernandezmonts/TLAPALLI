import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'CLAVE_SECRETA_SIGETACH_2025', // ¡Cambia esto en producción!
      signOptions: { expiresIn: '8h' },
    }),
    // No necesitas importar PrismaModule porque es global
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
