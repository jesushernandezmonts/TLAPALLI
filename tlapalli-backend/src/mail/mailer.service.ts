import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get('SMTP_FROM');
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña para TLAPALLI.</p>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste esto, puedes ignorar este correo.</p>
    `;

    await this.sendMail(email, 'Restablecer Contraseña - TLAPALLI', html);
  }
}
