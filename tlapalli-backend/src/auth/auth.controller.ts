import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body('nombre') nombre: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('instructorId') instructorId?: number,
  ) {
    // Validar contraseña fuerte
    const validacion = this.authService.validarFortalezaPassword(password);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.register(nombre, email, password, instructorId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(email, password);

    // Guardar refresh token en cookie httpOnly
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // solo HTTPS en producción
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    // No devolver el refresh token en el cuerpo
    return {
      accessToken: result.accessToken,
      usuario: result.usuario,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token no encontrado');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    // Actualizar cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    return { message: 'Sesión cerrada' };
  }

  // ========== GOOGLE AUTH ==========
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);

    // Guardar refresh token en cookie httpOnly
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Redirigir al frontend con el accessToken en la URL (o usar un mensaje postMessage)
    // Para simplificar, redirigimos a una ruta que procese el login
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/success?token=${result.accessToken}`);
  }

  // ========== PASSWORD RECOVERY ==========
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    // Validar contraseña fuerte
    const validacion = this.authService.validarFortalezaPassword(password);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.resetPassword(token, password);
  }
}
