import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, BadRequestException, UseGuards, Query, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { GoogleAuthGuard } from './strategies/google-auth.guard';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { RolesGuard } from './strategies/roles.guard';
import { Roles } from './strategies/roles.decorator';
import { AlumnoLoginDto } from './dto/alumno-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ========== ALUMNO AUTH ==========

  @Post('alumno/login')
  @HttpCode(HttpStatus.OK)
  async alumnoLogin(
    @Body() dto: AlumnoLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.alumnoLogin(dto.email, dto.password);

    res.cookie('alumnoRefreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      accessToken: result.accessToken,
      alumno: result.alumno,
    };
  }

  @Post('alumno/refresh')
  @HttpCode(HttpStatus.OK)
  async alumnoRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.alumnoRefreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token no encontrado');
    }

    const result = await this.authService.alumnoRefreshTokens(refreshToken);

    res.cookie('alumnoRefreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken: result.accessToken };
  }

  @Post('alumno/logout')
  @HttpCode(HttpStatus.OK)
  async alumnoLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.alumnoRefreshToken;
    if (refreshToken) {
      await this.authService.alumnoLogout(refreshToken);
    }
    res.clearCookie('alumnoRefreshToken');
    return { message: 'Sesión cerrada' };
  }

  // ========== ADMIN: Crear acceso para alumno ==========

  @Patch('alumno/crear-acceso/:alumnoId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async crearAccesoAlumno(
    @Param('alumnoId', ParseIntPipe) alumnoId: number,
    @Body('email') email: string,
  ) {
    if (!email) {
      throw new BadRequestException('El email es requerido');
    }
    return this.authService.crearAccesoAlumno(alumnoId, email);
  }

  // ========== ACTIVAR CUENTA ALUMNO ==========
  @Post('alumno/activar-cuenta')
  async activarCuentaAlumno(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    if (!token || !password) {
      throw new BadRequestException('Token y contraseña son requeridos');
    }
    const validacion = this.authService.validarFortalezaPassword(password);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.activarCuentaAlumno(token, password);
  }

  // ========== EXISTING AUTH METHODS ==========

  @Post('register')
  async register(
    @Body('nombre') nombre: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('instructorId') instructorId?: number,
  ) {
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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

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

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken: result.accessToken };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('La contraseña actual y la nueva son requeridas');
    }
    const validacion = this.authService.validarFortalezaPassword(newPassword);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.changePassword(req.user.id, currentPassword, newPassword);
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
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/success?token=${result.accessToken}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorMsg = encodeURIComponent(error.message || 'Error de autenticación');
      return res.redirect(`${frontendUrl}/login?error=${errorMsg}`);
    }
  }

  // ========== VALIDAR INVITACIÓN ==========
  @Get('validate-invitation')
  async validateInvitation(@Query('token') token: string) {
    return this.authService.validateInvitation(token);
  }

  // ========== ACTIVAR CUENTA ==========
  @Post('activate-account')
  async activateAccount(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    const validacion = this.authService.validarFortalezaPassword(password);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.activateAccount(token, password);
  }

  // ========== PASSWORD RECOVERY ==========
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    const validacion = this.authService.validarFortalezaPassword(password);
    if (!validacion.valida) {
      throw new BadRequestException(validacion.mensaje);
    }
    return this.authService.resetPassword(token, password);
  }
}
