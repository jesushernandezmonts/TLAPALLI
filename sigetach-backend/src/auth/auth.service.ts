import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(nombre: string, email: string, password: string, rol: string = 'profesor') {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    const usuario = await this.prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: hash,
        rol,
      },
    });
    return { id: usuario.id, email: usuario.email, rol: usuario.rol };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
