import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface CrearNotificacion {
  usuarioId: number;
  mensaje: string;
  prioridad?: Prioridad;
  vehiculoId?: number | null;
  citaId?: number | null;
}

@Injectable()
export class Notificador {
  constructor(private readonly prisma: PrismaService) {}

  async enviar(n: CrearNotificacion) {
    await this.prisma.notificacion.create({
      data: {
        usuarioId: n.usuarioId,
        vehiculoId: n.vehiculoId ?? null,
        citaId: n.citaId ?? null,
        mensaje: n.mensaje,
        prioridad: (n.prioridad ?? 'MEDIA') as any,
      },
    });
  }
}
