import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '../mail/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  // ========== REGISTRO (solo admin crea usuarios) ==========
  async register(nombre: string, email: string, password: string, instructorId?: number) {
    const existe = await this.prisma.usuario.findUnique({ where: { email } });
    if (existe) throw new ForbiddenException('El email ya está registrado');

    const SALT_ROUNDS = 12;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    return this.prisma.usuario.create({
      data: {
        nombre,
        email,
        passwordHash: hash,
        rol: 'profesor',
        instructorId: instructorId || null,
      },
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  // ========== LOGIN SEGURO ==========
  async login(email: string, password: string) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    // Verificar que el instructor esté activo (si es profesor)
    if (usuario.instructorId) {
      const instructor = await this.prisma.instructor.findUnique({ where: { id: usuario.instructorId } });
      if (instructor && instructor.estado === 'Inactivo') {
        throw new ForbiddenException('Tu cuenta ha sido desactivada. Contacta al administrador.');
      }
      if (instructor && instructor.estado === 'Pendiente' && !usuario.passwordHash) {
        throw new UnauthorizedException('Tu cuenta aún no ha sido activada. Revisa tu correo electrónico para activarla.');
      }
    }

    // Verificar bloqueo
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutosRestantes = Math.ceil((usuario.bloqueadoHasta.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Cuenta bloqueada. Intente de nuevo en ${minutosRestantes} minutos.`);
    }

    // Verificar contraseña
    if (!usuario.passwordHash) {
      throw new UnauthorizedException('Tu cuenta aún no tiene contraseña. Revisa tu correo para activarla, o usa "Continuar con Google".');
    }

    const isMatch = await bcrypt.compare(password, usuario.passwordHash);
    if (!isMatch) {
      await this.registrarIntentoFallido(usuario.id, usuario.intentosFallidos);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Resetear intentos fallidos
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null },
    });

    // Generar tokens
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      instructorId: usuario.instructorId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = await this.generarRefreshToken(usuario.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        instructorId: usuario.instructorId,
      },
    };
  }

  // ========== GOOGLE LOGIN (Unificación por Email) ==========
  async googleLogin(req) {
    if (!req.user) {
      throw new BadRequestException('No se recibió información de Google');
    }

    const { email, googleId, fullName } = req.user;

    // 1. Buscar usuario por email (Unificación automática)
    let usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (usuario) {
      // Si el usuario existe pero no tiene googleId, lo vinculamos ahora
      if (!usuario.googleId) {
        usuario = await this.prisma.usuario.update({
          where: { id: usuario.id },
          data: { googleId },
        });
      }

      // Si es profesor con instructor vinculado, activar el instructor automáticamente
      if (usuario.instructorId) {
        const instructor = await this.prisma.instructor.findUnique({ where: { id: usuario.instructorId } });
        if (instructor) {
          if (instructor.estado === 'Inactivo') {
            throw new ForbiddenException('Tu cuenta ha sido desactivada. Contacta al administrador.');
          }
          // Activar si estaba pendiente
          if (instructor.estado === 'Pendiente') {
            await this.prisma.instructor.update({
              where: { id: instructor.id },
              data: { estado: 'Activo' },
            });
          }
        }
      }
    } else {
      // 2. Si NO existe el usuario, verificamos si es un instructor registrado por el Admin
      const instructor = await this.prisma.instructor.findFirst({
        where: { email },
      });

      if (instructor) {
        if (instructor.estado === 'Inactivo') {
          throw new ForbiddenException('Tu cuenta ha sido desactivada. Contacta al administrador.');
        }

        // El admin ya lo dio de alta como instructor, creamos su usuario automáticamente
        usuario = await this.prisma.usuario.create({
          data: {
            nombre: instructor.nombre,
            email: email,
            googleId: googleId,
            passwordHash: null,
            rol: 'profesor',
            instructorId: instructor.id,
          },
        });

        // Activar el instructor
        await this.prisma.instructor.update({
          where: { id: instructor.id },
          data: { estado: 'Activo' },
        });
      } else {
        // 3. No existe ni como usuario ni como instructor
        // BLOQUEAR: Solo usuarios pre-registrados por el admin pueden entrar
        throw new UnauthorizedException('No tienes una cuenta registrada en el sistema. Contacta al administrador.');
      }
    }

    // Generar tokens
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      instructorId: usuario.instructorId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m',
    });

    const refreshToken = await this.generarRefreshToken(usuario.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        instructorId: usuario.instructorId,
      },
    };
  }

  // ========== ACTIVAR CUENTA (Opción B) ==========
  async activateAccount(token: string, newPassword: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!usuario) {
      throw new BadRequestException('El enlace de activación es inválido o ha expirado. Solicita al administrador que te reenvíe uno nuevo.');
    }

    // Verificar que el instructor existe y no está ya activo
    if (usuario.instructorId) {
      const instructor = await this.prisma.instructor.findUnique({ where: { id: usuario.instructorId } });
      if (instructor && instructor.estado === 'Inactivo') {
        throw new BadRequestException('Esta cuenta ha sido desactivada por el administrador.');
      }
    }

    const SALT_ROUNDS = 12;
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Actualizar usuario: guardar contraseña, limpiar token
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExp: null,
        intentosFallidos: 0,
        bloqueadoHasta: null,
      },
    });

    // Activar el instructor
    if (usuario.instructorId) {
      await this.prisma.instructor.update({
        where: { id: usuario.instructorId },
        data: { estado: 'Activo' },
      });
    }

    return { message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.' };
  }

  // ========== FORGOT PASSWORD ==========
  async forgotPassword(email: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      // Por seguridad no decimos si el email existe o no
      return { message: 'Si el correo está registrado, recibirás un enlace de recuperación' };
    }

    // Verificar que esté activo
    if (usuario.instructorId) {
      const instructor = await this.prisma.instructor.findUnique({ where: { id: usuario.instructorId } });
      if (instructor && instructor.estado === 'Inactivo') {
        return { message: 'Si el correo está registrado, recibirás un enlace de recuperación' };
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: token,
        resetTokenExp: expires,
      }
    });

    await this.mailerService.sendResetPasswordEmail(email, token);

    return { message: 'Si el correo está registrado, recibirás un enlace de recuperación' };
  }

  // ========== RESET PASSWORD ==========
  async resetPassword(token: string, newPassword: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() }
      }
    });

    if (!usuario) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const SALT_ROUNDS = 12;
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExp: null,
        intentosFallidos: 0,
        bloqueadoHasta: null,
      }
    });

    return { message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' };
  }

  // ========== REFRESH TOKEN ==========
  async refreshTokens(refreshTokenStr: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { usuario: true },
    });

    if (!token || token.revocado || token.expiraEn < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Revocar el viejo con seguridad
    try {
      await this.prisma.refreshToken.update({
        where: { id: token.id },
        data: { revocado: true },
      });
    } catch (error) {
      // Si el registro desapareció en el intermedio, simplemente invalidamos
      throw new UnauthorizedException('Sesión expirada');
    }

    // Generar nuevos
    const payload = {
      sub: token.usuario.id,
      email: token.usuario.email,
      rol: token.usuario.rol,
      instructorId: token.usuario.instructorId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const newRefreshToken = await this.generarRefreshToken(token.usuario.id);

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  // ========== LOGOUT ==========
  async logout(refreshTokenStr: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshTokenStr },
      data: { revocado: true },
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  // ========== HELPER: Generar Refresh Token ==========
  private async generarRefreshToken(usuarioId: number) {
    // Limpiar tokens viejos
    await this.prisma.refreshToken.deleteMany({
      where: {
        usuarioId,
        OR: [{ revocado: true }, { expiraEn: { lt: new Date() } }],
      },
    });

    return this.prisma.refreshToken.create({
      data: {
        token: crypto.randomBytes(64).toString('hex'),
        usuarioId,
        expiraEn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });
  }

  // ========== PROTECCIÓN CONTRA FUERZA BRUTA ==========
  private async registrarIntentoFallido(usuarioId: number, intentosActuales: number) {
    const intentos = intentosActuales + 1;

    if (intentos >= 5) {
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          intentosFallidos: intentos,
          bloqueadoHasta: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
        },
      });
      throw new ForbiddenException('Cuenta bloqueada por 15 minutos tras múltiples intentos fallidos');
    }

    await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { intentosFallidos: intentos },
    });
  }

  // ========== VALIDAR CONTRASEÑA FUERTE ==========
  validarFortalezaPassword(password: string): { valida: boolean; mensaje: string } {
    if (password.length < 8) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos una mayúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos un número' };
    }
    return { valida: true, mensaje: 'Contraseña válida' };
  }
}
