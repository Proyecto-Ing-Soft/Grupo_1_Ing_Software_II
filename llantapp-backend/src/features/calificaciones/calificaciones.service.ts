import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CalificacionDto } from './dto/calificacion.dto';
import { withTenant } from '../../common/prisma-tenant';
import { Prisma } from '@prisma/client';
import { Notificador } from '../notificaciones/envio/notificador';

// SRP/DIP: toda la lógica de calificaciones de citas vive aquí,
// usando SQL contra el esquema del taller y delegando notificaciones a una fachada.

@Injectable()
export class CalificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificador: Notificador,
  ) {}

  esRolAdmin(rol?: string): boolean {
    if (!rol) return false;
    return rol === 'OWNER' || rol === 'ADMIN_TALLER';
  }

  async crear(
    slugTaller: string,
    citaId: number,
    clienteId: number,
    dto: CalificacionDto,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const rows = await tx.$queryRaw<
        Array<{
          cita_id: bigint;
          cliente_usuario_id: bigint;
          estado_codigo: string;
          mantenimiento_id: bigint | null;
          mecanico_principal_usuario_id: bigint | null;
          vehiculo_id: bigint;
        }>
      >(Prisma.sql`
        SELECT
          c.cita_id,
          c.cliente_usuario_id,
          ec.codigo AS estado_codigo,
          m.mantenimiento_id,
          m.mecanico_principal_usuario_id,
          c.vehiculo_id
        FROM cita c
        JOIN estado_cita ec
          ON ec.estado_cita_id = c.estado_cita_id
        LEFT JOIN mantenimiento m
          ON m.cita_id = c.cita_id
        WHERE c.cita_id = ${citaId}
        LIMIT 1
      `);

      if (!rows.length) {
        throw new NotFoundException('Cita no encontrada');
      }

      const c = rows[0];

      if (Number(c.cliente_usuario_id) !== clienteId) {
        throw new ForbiddenException('No puedes calificar esta cita');
      }

      if (c.estado_codigo !== 'terminada') {
        throw new BadRequestException(
          'Solo se puede calificar una cita terminada',
        );
      }

      if (!c.mantenimiento_id) {
        throw new BadRequestException(
          'La cita aún no está lista para calificación',
        );
      }

      const mantenimientoId = Number(c.mantenimiento_id);

      const existente = await tx.$queryRaw<
        Array<{ calificacion_id: bigint }>
      >(Prisma.sql`
        SELECT calificacion_id
        FROM calificacion
        WHERE mantenimiento_id = ${mantenimientoId}
          AND cliente_usuario_id = ${clienteId}
        LIMIT 1
      `);

      if (existente.length) {
        throw new BadRequestException('Esta cita ya fue calificada');
      }

      const inserted = await tx.$queryRaw<
        Array<{ calificacion_id: bigint }>
      >(Prisma.sql`
        INSERT INTO calificacion (
          mantenimiento_id,
          cliente_usuario_id,
          puntuacion,
          comentario,
          visible
        )
        VALUES (
          ${mantenimientoId},
          ${clienteId},
          ${dto.estrellas},
          ${dto.comentario ?? null},
          TRUE
        )
        RETURNING calificacion_id
      `);

      const calificacionId = Number(inserted[0].calificacion_id);

      // Notificación al mecánico principal (best-effort).
      if (c.mecanico_principal_usuario_id) {
        try {
          await this.notificador.enviar({
            tallerSlug: slugTaller,
            usuarioId: Number(c.mecanico_principal_usuario_id),
            titulo: 'Nueva calificación recibida',
            mensaje: `El cliente calificó la cita #${citaId} con ${dto.estrellas}★.`,
            tipoMensajeCodigo: 'resumen_tecnico',
            canalCodigo: 'push',
          });
        } catch {
          // No afecta el flujo principal.
        }
      }

      return { ok: true, calificacionId };
    });
  }

  /**
   * Lee la calificación asociada a una cita (si existe).
   * Visible para:
   *  - Cliente dueño de la cita
   *  - Mecánico principal asignado
   *  - Roles admin (OWNER / ADMIN_TALLER) según JWT.
   */
  async leerPorCita(
    slugTaller: string,
    citaId: number,
    solicitanteId: number,
    rol?: string,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const rows = await tx.$queryRaw<
        Array<{
          cita_id: bigint;
          cliente_usuario_id: bigint;
          mantenimiento_id: bigint | null;
          mecanico_principal_usuario_id: bigint | null;
        }>
      >(Prisma.sql`
        SELECT
          c.cita_id,
          c.cliente_usuario_id,
          m.mantenimiento_id,
          m.mecanico_principal_usuario_id
        FROM cita c
        LEFT JOIN mantenimiento m
          ON m.cita_id = c.cita_id
        WHERE c.cita_id = ${citaId}
        LIMIT 1
      `);

      if (!rows.length) {
        throw new NotFoundException('Cita no encontrada');
      }

      const c = rows[0];

      const esDueno =
        Number(c.cliente_usuario_id) === Number(solicitanteId);
      const esMecanico =
        c.mecanico_principal_usuario_id != null &&
        Number(c.mecanico_principal_usuario_id) ===
          Number(solicitanteId);
      const esAdmin = this.esRolAdmin(rol);

      if (!esDueno && !esMecanico && !esAdmin) {
        throw new ForbiddenException(
          'No puedes ver la calificación de esta cita',
        );
      }

      if (!c.mantenimiento_id) {
        throw new NotFoundException(
          'La cita aún no tiene calificación registrada',
        );
      }

      const mantenimientoId = Number(c.mantenimiento_id);

      const califRows = await tx.$queryRaw<
        Array<{
          calificacion_id: bigint;
          mantenimiento_id: bigint;
          cliente_usuario_id: bigint;
          puntuacion: number;
          comentario: string | null;
          visible: boolean;
          fecha_creacion: Date;
        }>
      >(Prisma.sql`
        SELECT
          calificacion_id,
          mantenimiento_id,
          cliente_usuario_id,
          puntuacion,
          comentario,
          visible,
          fecha_creacion
        FROM calificacion
        WHERE mantenimiento_id = ${mantenimientoId}
        LIMIT 1
      `);

      if (!califRows.length) {
        throw new NotFoundException(
          'La cita aún no tiene calificación registrada',
        );
      }

      const calif = califRows[0];

      return {
        calificacionId: Number(calif.calificacion_id),
        citaId,
        clienteUsuarioId: Number(calif.cliente_usuario_id),
        puntuacion: calif.puntuacion,
        comentario: calif.comentario,
        visible: calif.visible,
        fechaCreacion: calif.fecha_creacion,
      };
    });
  }

  /**
   * Calificaciones hechas por el cliente autenticado (por cita).
   */
  async miasCliente(
    slugTaller: string,
    clienteId: number,
    page: number,
    pageSize: number,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const skip = (page - 1) * pageSize;

      const items = await tx.$queryRaw<
        Array<{
          calificacion_id: bigint;
          puntuacion: number;
          comentario: string | null;
          fecha_creacion: Date;
          cita_id: bigint;
          fecha_programada: Date;
          placa: string | null;
        }>
      >(Prisma.sql`
        SELECT
          ca.calificacion_id,
          ca.puntuacion,
          ca.comentario,
          ca.fecha_creacion,
          c.cita_id,
          c.fecha_programada,
          v.placa
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        JOIN cita c
          ON c.cita_id = m.cita_id
        LEFT JOIN vehiculo v
          ON v.vehiculo_id = c.vehiculo_id
        WHERE ca.cliente_usuario_id = ${clienteId}
        ORDER BY ca.fecha_creacion DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `);

      const totalRows = await tx.$queryRaw<
        Array<{ total: bigint }>
      >(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM calificacion ca
        WHERE ca.cliente_usuario_id = ${clienteId}
      `);

      const total = Number(totalRows[0]?.total ?? 0);

      return {
        items: items.map((r) => ({
          calificacionId: Number(r.calificacion_id),
          puntuacion: r.puntuacion,
          comentario: r.comentario,
          fechaCreacion: r.fecha_creacion,
          citaId: Number(r.cita_id),
          fechaCita: r.fecha_programada,
          placa: r.placa,
        })),
      total,
      page,
      pageSize,
      };
    });
  }

  /**
   * Calificaciones recibidas por el mecánico (según mecánico_principal_usuario_id).
   */
  async recibidasMecanico(
    slugTaller: string,
    mecanicoId: number,
    page: number,
    pageSize: number,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const skip = (page - 1) * pageSize;

      const items = await tx.$queryRaw<
        Array<{
          calificacion_id: bigint;
          puntuacion: number;
          comentario: string | null;
          fecha_creacion: Date;
          cita_id: bigint;
          fecha_programada: Date;
          placa: string | null;
          cliente_id: bigint;
          cliente_nombres: string;
          cliente_apellidos: string;
        }>
      >(Prisma.sql`
        SELECT
          ca.calificacion_id,
          ca.puntuacion,
          ca.comentario,
          ca.fecha_creacion,
          c.cita_id,
          c.fecha_programada,
          v.placa,
          cli.usuario_id      AS cliente_id,
          cli.nombres         AS cliente_nombres,
          cli.apellidos       AS cliente_apellidos
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        JOIN cita c
          ON c.cita_id = m.cita_id
        LEFT JOIN vehiculo v
          ON v.vehiculo_id = c.vehiculo_id
        JOIN usuario cli
          ON cli.usuario_id = ca.cliente_usuario_id
        WHERE m.mecanico_principal_usuario_id = ${mecanicoId}
        ORDER BY ca.fecha_creacion DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `);

      const totalRows = await tx.$queryRaw<
        Array<{ total: bigint }>
      >(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        WHERE m.mecanico_principal_usuario_id = ${mecanicoId}
      `);

      const total = Number(totalRows[0]?.total ?? 0);

      return {
        items: items.map((r) => ({
          calificacionId: Number(r.calificacion_id),
          puntuacion: r.puntuacion,
          comentario: r.comentario,
          fechaCreacion: r.fecha_creacion,
          citaId: Number(r.cita_id),
          fechaCita: r.fecha_programada,
          placa: r.placa,
          cliente: {
            usuarioId: Number(r.cliente_id),
            nombreCompleto: `${r.cliente_nombres} ${r.cliente_apellidos}`.trim(),
          },
        })),
        total,
        page,
        pageSize,
      };
    });
  }

  /**
   * Listado admin filtrado por mecánico, puntuación, rango de fechas, placa.
   */
  async adminList(
    slugTaller: string,
    page: number,
    pageSize: number,
    filtros: {
      mecanicoId?: number;
      estrellas?: number;
      desde?: Date;
      hasta?: Date;
      placa?: string;
    },
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const skip = (page - 1) * pageSize;

      const conditions: Prisma.Sql[] = [];

      if (filtros.estrellas) {
        conditions.push(
          Prisma.sql`ca.puntuacion = ${filtros.estrellas}`,
        );
      }
      if (filtros.desde) {
        conditions.push(
          Prisma.sql`ca.fecha_creacion >= ${filtros.desde}`,
        );
      }
      if (filtros.hasta) {
        conditions.push(
          Prisma.sql`ca.fecha_creacion <= ${filtros.hasta}`,
        );
      }
      if (filtros.mecanicoId) {
        conditions.push(
          Prisma.sql`
            m.mecanico_principal_usuario_id = ${filtros.mecanicoId}
          `,
        );
      }
      if (filtros.placa) {
        conditions.push(
          Prisma.sql`
            v.placa ILIKE ${'%' + filtros.placa + '%'}
          `,
        );
      }

      const whereSql =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(
              conditions,
              ' AND ',
            )}`
          : Prisma.sql``;

      const items = await tx.$queryRaw<
        Array<{
          calificacion_id: bigint;
          puntuacion: number;
          comentario: string | null;
          fecha_creacion: Date;
          cita_id: bigint;
          fecha_programada: Date;
          placa: string | null;
          mecanico_id: bigint | null;
          mecanico_nombres: string | null;
          mecanico_apellidos: string | null;
          cliente_id: bigint;
          cliente_nombres: string;
          cliente_apellidos: string;
        }>
      >(Prisma.sql`
        SELECT
          ca.calificacion_id,
          ca.puntuacion,
          ca.comentario,
          ca.fecha_creacion,
          c.cita_id,
          c.fecha_programada,
          v.placa,
          mec.usuario_id      AS mecanico_id,
          mec.nombres         AS mecanico_nombres,
          mec.apellidos       AS mecanico_apellidos,
          cli.usuario_id      AS cliente_id,
          cli.nombres         AS cliente_nombres,
          cli.apellidos       AS cliente_apellidos
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        JOIN cita c
          ON c.cita_id = m.cita_id
        LEFT JOIN vehiculo v
          ON v.vehiculo_id = c.vehiculo_id
        LEFT JOIN usuario mec
          ON mec.usuario_id = m.mecanico_principal_usuario_id
        JOIN usuario cli
          ON cli.usuario_id = ca.cliente_usuario_id
        ${whereSql}
        ORDER BY ca.fecha_creacion DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `);

      const totalRows = await tx.$queryRaw<
        Array<{ total: bigint }>
      >(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        JOIN cita c
          ON c.cita_id = m.cita_id
        LEFT JOIN vehiculo v
          ON v.vehiculo_id = c.vehiculo_id
        ${whereSql}
      `);

      const total = Number(totalRows[0]?.total ?? 0);

      return {
        items: items.map((r) => ({
          calificacionId: Number(r.calificacion_id),
          puntuacion: r.puntuacion,
          comentario: r.comentario,
          fechaCreacion: r.fecha_creacion,
          citaId: Number(r.cita_id),
          fechaCita: r.fecha_programada,
          placa: r.placa,
          mecanico:
            r.mecanico_id != null
              ? {
                  usuarioId: Number(r.mecanico_id),
                  nombreCompleto: `${r.mecanico_nombres ?? ''} ${
                    r.mecanico_apellidos ?? ''
                  }`.trim(),
                }
              : null,
          cliente: {
            usuarioId: Number(r.cliente_id),
            nombreCompleto: `${r.cliente_nombres} ${r.cliente_apellidos}`.trim(),
          },
        })),
        total,
        page,
        pageSize,
      };
    });
  }

  /**
   * Métricas agregadas de calificaciones por cita en el taller.
   */
  async adminStats(slugTaller: string) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const distrib = await tx.$queryRaw<
        Array<{ puntuacion: number; total: bigint }>
      >(Prisma.sql`
        SELECT
          puntuacion,
          COUNT(*)::bigint AS total
        FROM calificacion
        GROUP BY puntuacion
        ORDER BY puntuacion
      `);

      const porMecanico = await tx.$queryRaw<
        Array<{
          mecanico_id: bigint;
          nombres: string | null;
          apellidos: string | null;
          promedio: number;
          total: bigint;
        }>
      >(Prisma.sql`
        SELECT
          m.mecanico_principal_usuario_id AS mecanico_id,
          u.nombres,
          u.apellidos,
          AVG(ca.puntuacion)::numeric(10,2) AS promedio,
          COUNT(*)::bigint AS total
        FROM calificacion ca
        JOIN mantenimiento m
          ON m.mantenimiento_id = ca.mantenimiento_id
        LEFT JOIN usuario u
          ON u.usuario_id = m.mecanico_principal_usuario_id
        WHERE m.mecanico_principal_usuario_id IS NOT NULL
        GROUP BY
          m.mecanico_principal_usuario_id,
          u.nombres,
          u.apellidos
        ORDER BY promedio DESC
      `);

      const global = await tx.$queryRaw<
        Array<{ promedio: number | null; total: bigint }>
      >(Prisma.sql`
        SELECT
          AVG(puntuacion)::numeric(10,2) AS promedio,
          COUNT(*)::bigint AS total
        FROM calificacion
      `);

      const g = global[0] ?? {
        promedio: 0,
        total: BigInt(0),
      };

      return {
        promedioGlobal: Number(g.promedio ?? 0),
        totalCalificaciones: Number(g.total ?? 0),
        distribucion: distrib.map((r) => ({
          puntuacion: r.puntuacion,
          total: Number(r.total),
        })),
        promedioPorMecanico: porMecanico.map((r) => ({
          mecanicoId: Number(r.mecanico_id),
          nombreCompleto: `${r.nombres ?? ''} ${
            r.apellidos ?? ''
          }`.trim(),
          promedio: Number(r.promedio),
          totalCalificaciones: Number(r.total),
        })),
      };
    });
  }
}
