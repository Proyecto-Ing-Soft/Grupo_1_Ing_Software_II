import { Injectable } from '@nestjs/common';
import { NotificacionPrismaRepo } from '../repos/notificacion.prisma.repo';

// PRINCIPIO (SRP): fachada para disparar notificaciones sin conocer detalles de persistencia.
// Los códigos (tipo_mensaje, canal, estado) provienen de la BD.
export interface EnvioNotificacion {
  tallerSlug: string;
  usuarioId: number;
  titulo: string;
  mensaje: string; // aquí puedes mencionar la cita en lugar de mantenimiento
  tipoMensajeCodigo?: string; // opcional: e.g. 'resumen_tecnico', tomado desde app.tipo_mensaje
  canalCodigo?: string; // opcional: e.g. 'push' o 'email', desde app.canal_notificacion
}

@Injectable()
export class Notificador {
  constructor(private readonly repo: NotificacionPrismaRepo) {}

  async enviar(data: EnvioNotificacion): Promise<void> {
    const cuerpoHtml = `${data.titulo}: ${data.mensaje}`;

    await this.repo.crear({
      tallerSlug: data.tallerSlug,
      usuarioId: data.usuarioId,
      titulo: data.titulo,
      mensajeHtml: cuerpoHtml,
      tipoMensajeCodigo: data.tipoMensajeCodigo,
      canalCodigo: data.canalCodigo,
    });
  }
}
