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
    const user = this.configService.get('SMTP_USER') || '';
    const pass = this.configService.get('SMTP_PASS') || '';

    // MODO SIMULADO: Solo si aún tiene credenciales de placeholder
    if (!user || user.includes('tu-correo') || !pass || pass.includes('tu-password')) {
      console.log('---------------------------------------------------------');
      console.log('📧 MODO DESARROLLO: ENVÍO DE EMAIL SIMULADO');
      console.log(`PARA: ${to}`);
      console.log(`ASUNTO: ${subject}`);
      // Extraer el link del HTML para mostrarlo fácilmente
      const link = html.match(/href="([^"]*)"/)?.[1];
      if (link) console.log(`🔗 ENLACE: ${link}`);
      console.log('---------------------------------------------------------');
      return;
    }

    try {
      const info = await this.transporter.sendMail({ from, to, subject, html });
      console.log(`✅ Email enviado a ${to} — ID: ${info.messageId}`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${to}:`, error.message);
      // Mostrar el link como fallback para no perder el token
      const link = html.match(/href="([^"]*)"/)?.[1];
      if (link) console.log(`🔗 ENLACE (backup): ${link}`);
      throw error; // Propagar para que el controlador lo maneje
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #f3e8ff;">
        <div style="background: linear-gradient(135deg, #db2777, #9333ea); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">TLAPALLI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">Centro Cultural Huamantla</p>
        </div>
        <div style="padding: 40px 30px; background: #fefefe;">
          <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px;">Recuperación de Contraseña</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Has solicitado restablecer tu contraseña para <strong>TLAPALLI</strong>.</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #db2777, #9333ea); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p style="font-size: 12px; color: #999;">O copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #db2777; word-break: break-all;">${resetUrl}</p>
        </div>
        <div style="background: #f8f4ff; padding: 20px 30px; border-top: 1px solid #f3e8ff;">
          <p style="font-size: 11px; color: #999; margin: 0;">⏰ Este enlace expirará en 15 minutos. Si no solicitaste esto, puedes ignorar este correo.</p>
        </div>
      </div>
    `;

    await this.sendMail(email, 'Restablecer Contraseña - TLAPALLI', html);
  }

  async sendActivationEmail(email: string, token: string, nombre: string, tallerNombre?: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const activationUrl = `${frontendUrl}/accept-invitation?token=${token}`;

    const tallerText = tallerNombre
      ? ` como profesor de <strong>${tallerNombre}</strong>`
      : ' como profesor';

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #f3e8ff;">
        <div style="background: linear-gradient(135deg, #db2777, #9333ea); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">TLAPALLI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">Centro Cultural Huamantla</p>
        </div>
        <div style="padding: 40px 30px; background: #fefefe;">
          <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px;">¡Invitación de Profesor!</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">¡Hola, <strong>${nombre}</strong>!</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">El administrador de Tlapalli te ha invitado a unirte${tallerText}. Para acceder a tu cuenta, haz clic en el siguiente enlace e inicia sesión con tu cuenta de Google:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="background: linear-gradient(135deg, #db2777, #9333ea); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Aceptar Invitación y Vincular Google</a>
          </div>
          <p style="font-size: 12px; color: #999;">O copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #db2777; word-break: break-all;">${activationUrl}</p>
        </div>
        <div style="background: #f8f4ff; padding: 20px 30px; border-top: 1px solid #f3e8ff;">
          <p style="font-size: 11px; color: #999; margin: 0;">⏰ Este enlace expirará en 24 horas. Si no reconoces esta invitación, puedes ignorar este correo.</p>
        </div>
      </div>
    `;

    await this.sendMail(email, 'Invitación a unirte como Profesor - TLAPALLI', html);
  }
}
