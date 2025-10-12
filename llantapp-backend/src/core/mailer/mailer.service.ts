import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const isGmail = (process.env.MAIL_HOST || '').includes('gmail.com');
    this.transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          }
        : {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT || 587),
            secure: String(process.env.MAIL_SECURE || 'false') === 'true',
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          }
    );
  }

  async send(opts: { to: string; subject: string; text?: string; html?: string; replyTo?: string; attachments?: Array<any> }) {

    const from =
      process.env.MAIL_FROM ||
      (process.env.MAIL_USER
        ? `LlantApp Bot <${process.env.MAIL_USER}>`
        : 'LlantApp Bot <no-reply@llantapp.local>');

    const to = opts.to || process.env.MAIL_TO;
    if (!to) throw new InternalServerErrorException('MAIL_TO no configurado');

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        replyTo: opts.replyTo,
        attachments: opts.attachments,
      });
      return { ok: true };
      } catch (e: any) {
        const details = [
          e?.code,
          e?.responseCode,
          e?.command,
          e?.message,
        ].filter(Boolean).join(' | ');

        console.error('[MailerService] Error SMTP:', details);

        throw new InternalServerErrorException(`Fallo al enviar correo${details ? `: ${details}` : ''}`);
      }

  }
}
