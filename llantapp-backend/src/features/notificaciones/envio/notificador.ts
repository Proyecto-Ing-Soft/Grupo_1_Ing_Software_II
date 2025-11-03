import { Injectable } from '@nestjs/common';
import { NotificacionPrismaRepo } from '../repos/notificacion.prisma.repo';

// Facade + SRP: interfaz simple para publicar notificaciones desde el dominio
export interface EnvioNotificacion {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  vehiculoId?: number | null;
  citaId?: number;
}

@Injectable()
export class Notificador {
  constructor(private readonly repo: NotificacionPrismaRepo) {}

  async enviar(data: EnvioNotificacion): Promise<void> {

    const cuerpo = `${data.titulo}: ${data.mensaje}`;
    await this.repo.crear({
      usuarioId: data.usuarioId,
      mensaje: cuerpo,
      vehiculoId: data.vehiculoId ?? null,
      citaId: data.citaId ?? null,
    });
  }
}
