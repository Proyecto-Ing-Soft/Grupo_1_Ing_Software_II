// src/notificaciones/reglas/regla-vencimiento-llanta.ts
import { IReglaNotificacion, ResultadoRegla } from './iregla-notificacion';
import { Vehiculo, Llanta } from '@prisma/client';

export class ReglaVencimientoLlanta implements IReglaNotificacion {
  constructor(private umbralDias: number) {}

  evaluar(vehiculo: Vehiculo, llantas: Llanta[]): ResultadoRegla | null {
    if (!vehiculo.choferId) return null;
    const hoy = new Date();

    for (const l of llantas) {
      const diffMs = new Date(l.fechaVencimiento).getTime() - hoy.getTime();
      const dias = Math.ceil(diffMs / (1000*60*60*24));
      if (dias <= this.umbralDias) {
        return {
          aplica: true,
          tipo: 'VENCIMIENTO_LLANTA',
          mensaje: `Vehículo ${vehiculo.placa}: llanta ${l.posicion ?? ''} vence en ${Math.max(dias,0)} días.`,
          prioridad: dias <= 2 ? 'ALTA' : 'MEDIA',
          usuarioId: vehiculo.choferId,
          vehiculoId: vehiculo.id,
          fechaLimite: l.fechaVencimiento ?? undefined,
        };
      }
    }
    return null;
  }
}
