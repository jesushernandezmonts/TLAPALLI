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
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    // MODO DESARROLLO: Si las credenciales son las de prueba, imprimimos en consola
    if (user.includes('tu-correo') || pass.includes('tu-password')) {
      console.log('---------------------------------------------------------');
      console.log('📧 MODO DESARROLLO: ENVÍO DE EMAIL SIMULADO');
      console.log(`PARA: ${to}`);
      console.log(`ASUNTO: ${subject}`);
      console.log('CONTENIDO HTML:');
      console.log(html);
      console.log('---------------------------------------------------------');
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('❌ Error enviando email real:', error.message);
      // En desarrollo, aunque falle el envío real, mostramos el link por si acaso
      console.log('🔗 Link de recuperación (backup):', html.match(/href="([^"]*)"/)?.[1]);
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h1 style="color: #db2777;">Recuperación de Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña para <strong>TLAPALLI</strong>.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #db2777; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 12px; color: #666;">O copia y pega este enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #db2777;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Este enlace expirará en 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
      </div>
    `;

    await this.sendMail(email, 'Restablecer Contraseña - TLAPALLI', html);
  }
}
