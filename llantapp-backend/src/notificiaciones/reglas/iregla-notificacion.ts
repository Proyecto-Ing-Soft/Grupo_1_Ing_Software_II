// src/notificaciones/reglas/iregla-notificacion.ts
import { Vehiculo, Llanta } from '@prisma/client';

export interface ResultadoRegla {
  aplica: boolean;
  mensaje: string;
  prioridad: 'BAJA'|'MEDIA'|'ALTA';
  fechaLimite?: Date;
  tipo: 'MANTENIMIENTO_KM'|'MANTENIMIENTO_FECHA'|'VENCIMIENTO_LLANTA';
  vehiculoId?: number;
  usuarioId: number; // chofer a notificar
}

export interface IReglaNotificacion {
  evaluar(vehiculo: Vehiculo, llantas: Llanta[]): ResultadoRegla | null;
}
