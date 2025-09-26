// src/notificaciones/reglas/regla-por-fecha.ts
import { IReglaNotificacion, ResultadoRegla } from './iregla-notificacion';
import { Vehiculo, Llanta } from '@prisma/client';

export class ReglaPorFecha implements IReglaNotificacion {
  constructor(private umbralDias: number) {}

  evaluar(vehiculo: Vehiculo, _llantas: Llanta[]): ResultadoRegla | null {
    if (!vehiculo.proximoMantenimientoFecha || !vehiculo.choferId) return null;
    const hoy = new Date();
    const diffMs = new Date(vehiculo.proximoMantenimientoFecha).getTime() - hoy.getTime();
    const dias = Math.ceil(diffMs / (1000*60*60*24));
    if (dias <= this.umbralDias) {
      const prioridad = dias <= 2 ? 'ALTA' : 'MEDIA';
      return {
        aplica: true,
        tipo: 'MANTENIMIENTO_FECHA',
        mensaje: `Vehículo ${vehiculo.placa}: mantenimiento por fecha en ${Math.max(dias,0)} días.`,
        prioridad,
        usuarioId: vehiculo.choferId,
        vehiculoId: vehiculo.id,
        fechaLimite: vehiculo.proximoMantenimientoFecha ?? undefined,
      };
    }
    return null;
  }
}
