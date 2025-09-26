// src/notificaciones/reglas/regla-por-kilometraje.ts
import { IReglaNotificacion, ResultadoRegla } from './iregla-notificacion';
import { Vehiculo, Llanta } from '@prisma/client';

export class ReglaPorKilometraje implements IReglaNotificacion {
  constructor(private umbralKm: number) {}

  evaluar(vehiculo: Vehiculo, _llantas: Llanta[]): ResultadoRegla | null {
    if (!vehiculo.proximoMantenimientoKm || !vehiculo.choferId) return null;
    const resta = vehiculo.proximoMantenimientoKm - vehiculo.kms;
    if (resta < 0 || resta <= this.umbralKm) {
      const prioridad = resta <= 200 ? 'ALTA' : (resta <= this.umbralKm ? 'MEDIA' : 'BAJA');
      return {
        aplica: true,
        tipo: 'MANTENIMIENTO_KM',
        mensaje: `Vehículo ${vehiculo.placa}: mantenimiento por km cercano (${vehiculo.kms}/${vehiculo.proximoMantenimientoKm}).`,
        prioridad,
        usuarioId: vehiculo.choferId,
        vehiculoId: vehiculo.id,
      };
    }
    return null;
  }
}
