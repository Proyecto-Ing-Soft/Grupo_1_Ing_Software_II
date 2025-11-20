import { getJSON } from '../../core/http/_http';

// Principio: Definición de Contratos (Tipos)
// Estos tipos definen el "contrato" que el frontend espera
// de la API. El back puede cambiar columnas o nombres, pero
// esta capa traduce todo a este modelo estable.

// Datos que consume la UI
export type VehiculoInfo = {
  vehiculo_id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string | null;
};

export type TrabajoRealizado = {
  id: number; // ID de la cita asociada (para evidencia)
  tipo: string; // Nombre del servicio
  fecha_fin: string | null;
  descripcion_trabajos: string | null;
  mecanico: string | null; // Nombre completo
  tiene_evidencia: boolean; // indica si hay evidencia asociada
};

export type ProximoServicio = {
  id: number; // ID de la cita
  tipo: string; // Nombre del servicio
  estado: string; // código/estado de la cita (SOLICITADA, EN_PROGRESO, etc.)
  fecha_programada: string | null;
  comentarios_cliente: string;
  mecanico: string | null; // Nombre completo si existe asignación
};

export type HistorialData = {
  vehiculo: VehiculoInfo;
  trabajosRealizados: TrabajoRealizado[];
  proximosServicios: ProximoServicio[];
};

// Shape genérico que DEVUELVE el backend (Raw)
// Usamos `any` dentro de la ACL para tolerar cambios de nombres
// (fecha_fin_mant vs fechaMantenimiento, servicio_nombre vs tipo, etc.).
type RawHistorialResponse = {
  vehiculo: any;
  trabajosRealizados?: any[];
  proximosServicios?: any[];
};

// Helper: normaliza nombre de mecánico a un string "Nombre Apellido" o "—"
function normalizarNombreMecanico(raw: any): string | null {
  if (typeof raw?.mecanico === 'string' && raw.mecanico.trim().length > 0) {
    return raw.mecanico;
  }

  const combinacion = [raw?.mecanico_nombres, raw?.mecanico_apellidos]
    .filter((p) => typeof p === 'string' && p.trim().length > 0)
    .join(' ')
    .trim();

  if (combinacion.length > 0) {
    return combinacion;
  }

  return null;
}

// Principio: Anti-Corruption Layer (ACL)
// Estas funciones traducen la respuesta "cruda" a los contratos de arriba.

function mapVehiculo(rawVehiculo: any): VehiculoInfo {
  const v = rawVehiculo ?? {};

  const id =
    v.vehiculo_id ??
    v.id ??
    v.vehiculoId ??
    0;

  const anio =
    typeof v.anio === 'number'
      ? v.anio
      : typeof v.anio === 'string'
        ? Number(v.anio) || 0
        : typeof v.year === 'number'
          ? v.year
          : 0;

  return {
    vehiculo_id: Number(id),
    placa: String(v.placa ?? '').toUpperCase(),
    marca: String(v.marca ?? ''),
    modelo: String(v.modelo ?? ''),
    anio,
    color: v.color ?? null,
  };
}

function mapTrabajo(raw: any): TrabajoRealizado {
  // El nuevo back trabaja centrado en "cita". Para evidencias
  // usamos preferentemente cita_id. Si no viene, caemos a id/mantenimiento_id.
  const citaId =
    raw.cita_id ??
    raw.citaId ??
    raw.id ??
    raw.mantenimiento_id ??
    raw.mantenimientoId ??
    0;

  const fechaFin =
    raw.fecha_fin ??
    raw.fechaFin ??
    raw.fecha_fin_mant ??
    raw.fechaMantenimiento ??
    raw.fecha_fin_mantenimiento ??
    null;

  const descripcion =
    raw.descripcion_trabajos ??
    raw.detalle_trabajo ??
    raw.trabajosRealizados ??
    raw.descripcion ??
    null;

  const tipoServicio =
    raw.tipo ??
    raw.servicio_nombre ??
    raw.servicio ??
    'Servicio';

  return {
    id: Number(citaId),
    tipo: String(tipoServicio),
    fecha_fin: fechaFin ? String(fechaFin) : null,
    descripcion_trabajos: descripcion ?? null,
    mecanico: normalizarNombreMecanico(raw),
    tiene_evidencia: Boolean(raw.tiene_evidencia),
  };
}

function mapProximo(raw: any): ProximoServicio {
  const citaId = raw.cita_id ?? raw.citaId ?? raw.id ?? 0;

  const tipoServicio =
    raw.tipo ??
    raw.servicio_nombre ??
    raw.servicio ??
    'Servicio';

  const estadoCodigo =
    raw.estado ??
    raw.estado_codigo ??
    raw.estadoCodigo ??
    raw.estado_nombre ??
    'SOLICITADA';

  const fechaProg =
    raw.fecha_programada ??
    raw.programadaPara ??
    raw.fechaProgramada ??
    null;

  const comentarios =
    raw.comentarios_cliente ??
    raw.comentario ??
    raw.comentarios ??
    '';

  const mecanico = normalizarNombreMecanico(raw);

  return {
    id: Number(citaId),
    tipo: String(tipoServicio),
    estado: String(estadoCodigo),
    fecha_programada: fechaProg ? String(fechaProg) : null,
    comentarios_cliente: String(comentarios ?? ''),
    mecanico,
  };
}

export const apiHistorial = {
  porVehiculo: async (vehiculoId: number, token?: string): Promise<HistorialData> => {
    // Principio: ACL
    // Aislamos a la UI de cómo el back nombre columnas/campos.
    const raw = await getJSON<RawHistorialResponse>(
      `/vehiculos/${vehiculoId}/historial`,
      token,
    );

    return {
      vehiculo: mapVehiculo(raw.vehiculo),
      trabajosRealizados: (raw.trabajosRealizados ?? []).map(mapTrabajo),
      proximosServicios: (raw.proximosServicios ?? []).map(mapProximo),
    };
  },
};
