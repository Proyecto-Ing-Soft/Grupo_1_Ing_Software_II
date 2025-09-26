// src/notificaciones/envio/notificador.ts
import { Injectable, Inject } from '@nestjs/common';
import { INotificacionRepo } from '../repos/inotificacion.repo';
import { ResultadoRegla } from '../reglas/iregla-notificacion';

@Injectable()
export class Notificador {
  constructor(@Inject('INotificacionRepo') private readonly repo: INotificacionRepo) {}

  async enviar(resultado: ResultadoRegla) {
    // Evitar duplicados idénticos pendientes (idempotencia básica)
    const existe = await this.repo.existePendienteIgual(
      resultado.usuarioId,
      resultado.vehiculoId,
      resultado.tipo,
      resultado.mensaje,
    );
    if (existe) return;

    await this.repo.crear({
      usuarioId: resultado.usuarioId,
      vehiculoId: resultado.vehiculoId,
      tipo: resultado.tipo,
      mensaje: resultado.mensaje,
      prioridad: resultado.prioridad,
      fechaLimite: resultado.fechaLimite,
    });
  }
}
