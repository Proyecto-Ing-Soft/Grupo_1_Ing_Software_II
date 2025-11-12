import { getJSON, postJSON } from '../../core/http/_http';

type Raw = Record<string, any>;

export interface Calificacion {
  id: number;
  citaId: number;
  clienteUsuarioId: number;
  estrellas: number;
  comentario?: string | null;
  creadaEn: string;
  visible?: boolean;
}

function toCalificacion(raw: Raw): Calificacion {
  return {
    id:
      raw.calificacionId ??
      raw.calificacion_id ??
      raw.id,
    citaId:
      raw.citaId ??
      raw.cita_id ??
      raw.mantenimientoId ??
      raw.mantenimiento_id ??
      raw.cita ??
      0,
    clienteUsuarioId:
      raw.clienteUsuarioId ??
      raw.cliente_usuario_id ??
      raw.clienteId ??
      raw.cliente ??
      0,
    estrellas:
      raw.puntuacion ??
      raw.estrellas ??
      raw.rating ??
      0,
    comentario:
      raw.comentario ??
      raw.resena ??
      null,
    creadaEn:
      (raw.fechaCreacion ??
        raw.fecha_creacion ??
        raw.creadaEn ??
        raw.creada ??
        new Date().toISOString()) as string,
    visible:
      typeof raw.visible === 'boolean'
        ? raw.visible
        : true,
  };
}

function toLista(raw: Raw): {
  items: Calificacion[];
  total: number;
  page: number;
  pageSize: number;
} {
  const itemsRaw =
    raw.items ??
    raw.data ??
    [];
  const items = Array.isArray(itemsRaw)
    ? itemsRaw.map(toCalificacion)
    : [];
  return {
    items,
    total: Number(
      raw.total ??
        raw.totalItems ??
        items.length
    ),
    page: Number(
      raw.page ??
        raw.pageIndex ??
        1
    ),
    pageSize: Number(
      raw.pageSize ??
        raw.limit ??
        items.length ??
        10
    ),
  };
}

export const apiCalificaciones = {
  leerPorCita: (
    citaId: number,
    token?: string
  ) =>
    getJSON<Raw>(
      `/calificaciones/cita/${citaId}`,
      token
    ),

  crear: (
    input: {
      citaId: number;
      estrellas: number;
      comentario?: string;
    },
    token?: string
  ): Promise<Calificacion> =>
    postJSON<Raw>(
      `/calificaciones`,
      {
        citaId: input.citaId,
        estrellas: input.estrellas,
        comentario:
          input.comentario ??
          null,
      },
      token
    ).then((raw) => {
      if (raw.ok && raw.calificacionId) {
        return {
          id: raw.calificacionId,
          citaId: input.citaId,
          clienteUsuarioId: 0,
          estrellas: input.estrellas,
          comentario:
            input.comentario ??
            null,
          creadaEn:
            new Date().toISOString(),
          visible: true,
        };
      }
      return toCalificacion(raw);
    }),

  mias: (
    q: {
      page?: number;
      pageSize?: number;
    },
    token?: string
  ) => {
    const p = new URLSearchParams();
    if (q.page)
      p.set('page', String(q.page));
    if (q.pageSize)
      p.set(
        'pageSize',
        String(q.pageSize)
      );
    return getJSON<Raw>(
      `/calificaciones/mias?${p.toString()}`,
      token
    ).then((raw) => {
      const items = (raw.items ??
        []).map((r: any) => ({
        id:
          r.calificacionId ??
          r.calificacion_id,
        citaId:
          r.citaId ??
          r.cita_id,
        clienteUsuarioId: 0,
        estrellas:
          r.puntuacion ??
          r.estrellas,
        comentario:
          r.comentario ??
          null,
        creadaEn:
          (r.fechaCreacion ??
            r.fecha_creacion ??
            new Date()) as any,
        visible: true,
      }));
      return {
        items,
        total:
          Number(
            raw.total
          ) || items.length,
        page:
          Number(
            raw.page
          ) || q.page || 1,
        pageSize:
          Number(
            raw.pageSize
          ) ||
          q.pageSize ||
          items.length ||
          10,
      };
    });
  },

  recibidas: (
    q: {
      page?: number;
      pageSize?: number;
    },
    token?: string
  ) => {
    const p = new URLSearchParams();
    if (q.page)
      p.set('page', String(q.page));
    if (q.pageSize)
      p.set(
        'pageSize',
        String(q.pageSize)
      );
    return getJSON<Raw>(
      `/calificaciones/recibidas?${p.toString()}`,
      token
    ).then((raw) => {
      const items = (raw.items ??
        []).map((r: any) => ({
        id:
          r.calificacionId ??
          r.calificacion_id,
        citaId:
          r.citaId ??
          r.cita_id,
        clienteId:
          r.cliente
            ?.usuarioId ??
          r.clienteId ??
          0,
        estrellas:
          r.puntuacion ??
          r.estrellas,
        comentario:
          r.comentario ??
          null,
        creadaEn:
          (r.fechaCreacion ??
            r.fecha_creacion ??
            new Date()) as any,
        cita: {
          id:
            r.citaId ??
            r.cita_id,
          fechaMantenimiento:
            r.fechaCita ??
            r.fecha_cita,
          placaPreliminar:
            r.placa ??
            null,
          marcaPreliminar:
            null,
          modeloPreliminar:
            null,
          estado: '',
        },
        cliente: r.cliente
          ? {
              id:
                r.cliente
                  .usuarioId,
              nombreCompleto:
                r.cliente
                  .nombreCompleto,
            }
          : null,
      }));
      return {
        items,
        total:
          Number(
            raw.total
          ) || items.length,
        page:
          Number(
            raw.page
          ) || q.page || 1,
        pageSize:
          Number(
            raw.pageSize
          ) ||
          q.pageSize ||
          items.length ||
          10,
      };
    });
  },

  adminList: (q: {
    page?: number;
    pageSize?: number;
    mecanicoId?: number;
    estrellas?: number;
    desde?: string;
    hasta?: string;
    placa?: string;
  }) => {
    const p = new URLSearchParams();
    if (q.page)
      p.set('page', String(q.page));
    if (q.pageSize)
      p.set(
        'pageSize',
        String(q.pageSize)
      );
    if (q.mecanicoId)
      p.set(
        'mecanicoId',
        String(q.mecanicoId)
      );
    if (q.estrellas)
      p.set(
        'estrellas',
        String(q.estrellas)
      );
    if (q.desde)
      p.set('desde', q.desde);
    if (q.hasta)
      p.set('hasta', q.hasta);
    if (q.placa)
      p.set('placa', q.placa);
    return getJSON<Raw>(
      `/calificaciones/admin?${p.toString()}`
    ).then((raw) => {
      const items =
        (raw.items ??
          []).map(
          (r: any) => ({
            id:
              r.calificacionId ??
              r.calificacion_id,
            citaId:
              r.citaId ??
              r.cita_id,
            clienteUsuarioId: 0,
            estrellas:
              r.puntuacion ??
              r.estrellas,
            comentario:
              r.comentario ??
              null,
            creadaEn:
              (r.fechaCreacion ??
                r.fecha_creacion ??
                new Date()) as any,
            cita: {
              id:
                r.citaId ??
                r.cita_id,
              placaPreliminar:
                r.placa ??
                null,
              fechaMantenimiento:
                r.fechaCita ??
                r.fecha_cita,
            },
            cliente: r.cliente
              ? {
                  nombreCompleto:
                    r.cliente
                      .nombreCompleto,
                }
              : null,
            mecanico: r.mecanico
              ? {
                  nombreCompleto:
                    r.mecanico
                      .nombreCompleto,
                }
              : null,
          })
        );
      return {
        items,
        total:
          Number(
            raw.total
          ) || items.length,
        page:
          Number(
            raw.page
          ) ||
          q.page ||
          1,
        pageSize:
          Number(
            raw.pageSize
          ) ||
          q.pageSize ||
          items.length ||
          10,
      };
    });
  },

  adminStats: () =>
    getJSON<Raw>(
      `/calificaciones/admin/stats`
    ).then((raw) => ({
      promedioGlobal:
        Number(
          raw.promedioGlobal
        ) || 0,
      totalCalificaciones:
        Number(
          raw.totalCalificaciones
        ) || 0,
      distribucion: (raw.distribucion ??
        raw.distribucionPuntuacion ??
        []
      ).map((d: any) => ({
        estrellas:
          d.estrellas ??
          d.puntuacion,
        total: Number(
          d.total
        ),
      })),
      promedioPorMecanico: (raw.promedioPorMecanico ??
        []
      ).map((m: any) => ({
        mecanicoId:
          m.mecanicoId ??
          m.mecanico_id,
        nombre:
          m.nombreCompleto ??
          m.nombre,
        promedio:
          Number(
            m.promedio
          ) || 0,
        n:
          Number(
            m.totalCalificaciones ??
              m.total
          ) || 0,
      })),
    })),
};
