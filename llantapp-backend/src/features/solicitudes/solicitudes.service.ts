import { Injectable } from '@nestjs/common';
import { MailerService } from '../../core/mailer/mailer.service';
import { SolicitudDto } from './dto/solicitud.dto';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

const BANNER_CID = 'llantapp_banner';
const BANNER_CANDIDATES = [
  join(__dirname, 'banner-solicitud-mail.png'),
  join(process.cwd(), 'src', 'features', 'solicitudes', 'solicitudes', 'banner-solicitud-mail.png'),
];

function resolveBannerPath(): string | null {
  for (const p of BANNER_CANDIDATES) {
    if (existsSync(p)) return p;
  }
  return null;
}

@Injectable()
export class SolicitudesService {
  constructor(private mailer: MailerService) {}
  private esc(v: unknown): string {
    return String(v ?? '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

private buildEmailPayload(d: SolicitudDto) {
  const lines = [
    'Solicitud de Taller - LlantApp',
    '',
    'Servicio disponible SOLO PERÚ',
    '',
    `Razón social: ${d.razonSocial}`,
    `RUC: ${d.ruc}`,
    `Nombre de contacto: ${d.contactoNombre}`,
    `Correo de contacto: ${d.contactoCorreo}`,
    `Teléfono: ${d.telefono}`,
    `Departamento/Ciudad: ${d.departamento} / ${d.ciudad}`,
    `Dirección: ${d.direccion}`,
    `Número de sedes: ${d.numSedes || '-'}`,
    `País: ${d.pais || 'Perú'}`,
    `Fuente: ${d.fuente || '-'}`,
    '',
    `Mensaje: ${d.mensaje || '-'}`,
  ];

  const text = lines.join('\n');

  const attachments: Array<any> = [];
  let bannerImgHtml = '';
  const bannerPath = resolveBannerPath();

  if (!bannerPath) {
    console.warn('[SolicitudesService] Banner PNG no encontrado en ninguno de:', BANNER_CANDIDATES);
  } else {
    try {
      attachments.push({
        filename: 'banner-solicitud-mail.png',
        content: readFileSync(bannerPath),
        contentType: 'image/png',
        contentDisposition: 'inline',
        cid: BANNER_CID,
      });
      bannerImgHtml = `<img src="cid:${BANNER_CID}" alt="Pedido LlantApp" style="display:block;width:100%;height:auto;border-top:1px solid #e5e7eb;">`;
    } catch (e) {
      console.warn('[SolicitudesService] No se pudo leer el banner en:', bannerPath, e);
    }
  }

  const html = `
  <div style="background-color:#f8fafc;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="padding:18px 24px 8px 24px;">
        <h1 style="margin:0;font-size:22px;color:#0f172a;">Nueva <b>solicitud de taller</b></h1>
        <div style="margin-top:4px;color:#334155;"><em>Servicio disponible solo en Perú</em></div>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">

      <div style="padding:16px 24px;">
        <p style="margin:0 0 12px 0;">Hemos recibido una solicitud con los siguientes datos:</p>
        <ul style="margin:0 0 16px 18px;padding:0;line-height:1.55;">
          <li><b>Razón social:</b> ${this.esc(d.razonSocial)}</li>
          <li><b>RUC:</b> ${this.esc(d.ruc)}</li>
          <li><b>Contacto:</b> ${this.esc(d.contactoNombre)}</li>
          <li><b>Correo:</b> <i>${this.esc(d.contactoCorreo)}</i></li>
          <li><b>Teléfono:</b> ${this.esc(d.telefono)}</li>
          <li><b>Ubicación:</b> ${this.esc(d.departamento)} / ${this.esc(d.ciudad)}</li>
          <li><b>Dirección:</b> ${this.esc(d.direccion)}</li>
          <li><b>N.º de sedes:</b> ${this.esc(d.numSedes || '-')}</li>
          <li><b>País:</b> ${this.esc(d.pais || 'Perú')}</li>
          <li><b>Fuente:</b> ${this.esc(d.fuente || '-')}</li>
        </ul>

        ${d.mensaje ? `<p style="margin:0 0 16px 0;"><b>Mensaje:</b> ${this.esc(d.mensaje)}</p>` : ''}

        <p style="margin:12px 0 6px 0;"><b>Siguientes pasos</b></p>
        <ul style="margin:0 0 12px 18px;padding:0;line-height:1.55;">
          <li>Validar la información enviada.</li>
          <li>Escribir en <b>24–48 h hábiles</b> al correo <i>${this.esc(d.contactoCorreo)}</i>.</li>
          <li>Coordinar el <em>onboarding</em> y la configuración del entorno.</li>
        </ul>
      </div>

      ${bannerImgHtml}
    </div>
    <div style="text-align:center;color:#64748b;font-size:12px;margin-top:10px;">© ${new Date().getFullYear()} LlantApp</div>
  </div>`;

  return { text, html, attachments };
}


  async registrar(d: SolicitudDto) {
    const { text, html, attachments } = this.buildEmailPayload(d);

    await this.mailer.send({
      to: process.env.MAIL_TO,
      subject: `Nueva Solicitud de Taller - ${d.razonSocial} (RUC ${d.ruc})`,
      text,
      html,
      replyTo: d.contactoCorreo,
      attachments,
    } as any);

    return { ok: true };
  }

}
