import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailService } from '@sendgrid/mail';
import { AppLogger } from '../common/logger/logger.service';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter | null = null;
  private sgMail: MailService | null = null;
  private logger: AppLogger;

  constructor(private configService: ConfigService) {
    this.logger = new AppLogger('MailerService');

    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);

    // 1. Configurar Nodemailer con Gmail SMTP (Prioridad 1 para garantizar entrega a la Bandeja Principal)
    if (smtpUser && smtpPass && !smtpPass.includes('tu-') && !smtpPass.includes('cambiar-')) {
      const isGmail = smtpUser.includes('@gmail.com') || smtpHost.includes('gmail');

      this.transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: 'gmail',
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
      );
      this.logger.log(`📧 Servicio de correo inicializado con ${isGmail ? 'Gmail Service' : 'SMTP'} (${smtpUser})`);
    } else {
      this.logger.warn('⚠️ SMTP_USER o SMTP_PASS no están configurados en el entorno. Revisa tus variables de entorno.');
    }

    // 2. Configurar SendGrid como fallback opcional
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY') || '';
    if (apiKey && !apiKey.includes('tu-api-key')) {
      this.sgMail = new MailService();
      this.sgMail.setApiKey(apiKey);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get<string>('SMTP_FROM') || 'TLAPALLI <jesushernandezmonts@gmail.com>';

    // A. Intentar envío directo con Gmail SMTP (Nodemailer)
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.success(`Email enviado exitosamente a ${to} via Gmail SMTP`);
        return;
      } catch (error: any) {
        this.logger.error(`Error enviando email via Gmail SMTP: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // B. Fallback a SendGrid
    if (this.sgMail) {
      try {
        const msg = { to, from, subject, html };
        await this.sgMail.send(msg);
        this.logger.success(`Email enviado a ${to} via SendGrid (Fallback)`);
        return;
      } catch (error: any) {
        this.logger.error(`Error enviando email via SendGrid: ${error.message}`, error.stack, 'MailerService');
      }
    }

    // C. Simulación si no hay transportes activos
    this.logger.email('MODO DESARROLLO/SIMULACIÓN: Email procesado');
    this.logger.email(`PARA: ${to}`);
    this.logger.email(`ASUNTO: ${subject}`);
    const link = html.match(/href="([^"]*)"/)?.[1];
    if (link) this.logger.info(`🔗 ENLACE: ${link}`);
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

  async sendAlumnoActivationEmail(email: string, token: string, nombre: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const activationUrl = `${frontendUrl}/alumno/activar-cuenta?token=${token}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">TLAPALLI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px;">Centro Cultural Huamantla</p>
        </div>
        <div style="padding: 40px 30px; background: #fefefe;">
          <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 16px;">¡Bienvenido a TLAPALLI!</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">¡Hola, <strong>${nombre}</strong>!</p>
          <p style="color: #555; font-size: 15px; line-height: 1.6;">El administrador te ha registrado en el <strong>Portal del Alumno</strong> de TLAPALLI. Para acceder, crea tu contraseña haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationUrl}" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block;">Activar mi Cuenta</a>
          </div>
          <p style="font-size: 12px; color: #999;">O copia y pega este enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #7c3aed; word-break: break-all;">${activationUrl}</p>
        </div>
        <div style="background: #f8f4ff; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 11px; color: #999; margin: 0;">⏰ Este enlace expirará en 7 días. Si no reconoces este registro, puedes ignorar este correo.</p>
        </div>
      </div>
    `;

    await this.sendMail(email, 'Activa tu cuenta - Portal del Alumno TLAPALLI', html);
  }
}
