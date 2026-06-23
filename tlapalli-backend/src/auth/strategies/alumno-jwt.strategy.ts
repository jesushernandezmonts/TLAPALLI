import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlumnoJwtStrategy extends PassportStrategy(Strategy, 'alumno-jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    // payload debe tener el tipo 'alumno'
    if (payload.tipo !== 'alumno') {
      throw new UnauthorizedException('Token no válido para alumnos');
    }

    const alumno = await this.prisma.alumno.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        nombre: true,
        email: true,
        authActivo: true,
        fotoUrl: true,
        estatusActivo: true,
      },
    });

    if (!alumno) {
      throw new UnauthorizedException('Alumno no encontrado');
    }

    if (!alumno.authActivo) {
      throw new UnauthorizedException('Acceso desactivado. Contacta al administrador.');
    }

    if (!alumno.estatusActivo) {
      throw new UnauthorizedException('El alumno está dado de baja.');
    }

    return {
      id: alumno.id,
      nombre: alumno.nombre,
      email: alumno.email,
      fotoUrl: alumno.fotoUrl,
      tipo: 'alumno',
    };
  }
}
