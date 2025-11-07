import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CrearServicioDto, ActualizarServicioDto } from './dto/servicio.dto';
import { withTenant } from '../../common/prisma-tenant';
import { Prisma } from '@prisma/client';

// SRP: encapsula reglas de catálogo de servicios y asociación con mecánicos por taller.
// DIP: depende de PrismaService + withTenant para aislar el detalle multi-tenant.

@Injectable()
export class CatalogoServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  // === Crear servicio en un taller ===
  async crear(slugTaller: string, dto: CrearServicioDto) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const codigo = dto.codigo.trim().toUpperCase();
      const nombre = dto.nombre.trim();
      const descripcion = dto.descripcion.trim();

      if (!codigo) {
        throw new BadRequestException(
          'El código no puede estar vacío',
        );
      }
      if (!nombre) {
        throw new BadRequestException(
          'El nombre no puede estar vacío',
        );
      }
      if (!descripcion) {
        throw new BadRequestException(
          'La descripción no puede estar vacía',
        );
      }

      try {
        const rows = await tx.$queryRaw<
          Array<{
            servicio_id: bigint;
            codigo: string;
            nombre: string;
            descripcion: string;
            precio_base: string; // numeric
            duracion_estimada_min: number;
            activo: boolean;
          }>
        >(Prisma.sql`
          INSERT INTO servicio (
            codigo,
            nombre,
            descripcion,
            precio_base,
            duracion_estimada_min,
            activo
          )
          VALUES (
            ${codigo},
            ${nombre},
            ${descripcion},
            ${dto.precioBase},
            ${dto.duracionEstimadaMin},
            ${dto.activo ?? true}
          )
          RETURNING
            servicio_id,
            codigo,
            nombre,
            descripcion,
            precio_base,
            duracion_estimada_min,
            activo
        `);

        const s = rows[0];

        return {
          id: Number(s.servicio_id),
          codigo: s.codigo,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precioBase: Number(s.precio_base),
          duracionEstimadaMin: s.duracion_estimada_min,
          activo: s.activo,
        };
      } catch (e: any) {
        if (e?.code === '23505') {
          throw new BadRequestException(
            'Ya existe un servicio con ese código',
          );
        }
        throw e;
      }
    });
  }

  // === Actualizar servicio ===
  async actualizar(
    slugTaller: string,
    id: number,
    dto: ActualizarServicioDto,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const existentes = await tx.$queryRaw<
        Array<{
          servicio_id: bigint;
          codigo: string;
          nombre: string;
          descripcion: string;
          precio_base: string;
          duracion_estimada_min: number;
          activo: boolean;
        }>
      >(Prisma.sql`
        SELECT
          servicio_id,
          codigo,
          nombre,
          descripcion,
          precio_base,
          duracion_estimada_min,
          activo
        FROM servicio
        WHERE servicio_id = ${id}
        LIMIT 1
      `);

      if (!existentes.length) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const sets: Prisma.Sql[] = [];

      if (dto.codigo !== undefined) {
        const codigo = dto.codigo.trim().toUpperCase();
        if (!codigo) {
          throw new BadRequestException(
            'El código no puede estar vacío',
          );
        }
        sets.push(Prisma.sql`codigo = ${codigo}`);
      }

      if (dto.nombre !== undefined) {
        const nombre = dto.nombre.trim();
        if (!nombre) {
          throw new BadRequestException(
            'El nombre no puede estar vacío',
          );
        }
        sets.push(Prisma.sql`nombre = ${nombre}`);
      }

      if (dto.descripcion !== undefined) {
        const descripcion = dto.descripcion.trim();
        if (!descripcion) {
          throw new BadRequestException(
            'La descripción no puede estar vacía',
          );
        }
        sets.push(Prisma.sql`descripcion = ${descripcion}`);
      }

      if (dto.activo !== undefined) {
        sets.push(Prisma.sql`activo = ${dto.activo}`);
      }

      if (dto.precioBase !== undefined) {
        sets.push(
          Prisma.sql`precio_base = ${dto.precioBase}`,
        );
      }

      if (dto.duracionEstimadaMin !== undefined) {
        sets.push(
          Prisma.sql`duracion_estimada_min = ${dto.duracionEstimadaMin}`,
        );
      }

      if (!sets.length) {
        const s = existentes[0];
        return {
          id: Number(s.servicio_id),
          codigo: s.codigo,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precioBase: Number(s.precio_base),
          duracionEstimadaMin: s.duracion_estimada_min,
          activo: s.activo,
        };
      }

      try {
        const rows = await tx.$queryRaw<
          Array<{
            servicio_id: bigint;
            codigo: string;
            nombre: string;
            descripcion: string;
            precio_base: string;
            duracion_estimada_min: number;
            activo: boolean;
          }>
        >(Prisma.sql`
          UPDATE servicio
          SET ${Prisma.join(sets, ', ')}
          WHERE servicio_id = ${id}
          RETURNING
            servicio_id,
            codigo,
            nombre,
            descripcion,
            precio_base,
            duracion_estimada_min,
            activo
        `);

        const s = rows[0];
        return {
          id: Number(s.servicio_id),
          codigo: s.codigo,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precioBase: Number(s.precio_base),
          duracionEstimadaMin: s.duracion_estimada_min,
          activo: s.activo,
        };
      } catch (e: any) {
        if (e?.code === '23505') {
          throw new BadRequestException(
            'Ya existe un servicio con ese código',
          );
        }
        throw e;
      }
    });
  }

  // === Cambiar estado activo/inactivo ===
  async cambiarEstado(
    slugTaller: string,
    id: number,
    activo: boolean,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const existe = await tx.$queryRaw<
        Array<{ servicio_id: bigint }>
      >(Prisma.sql`
        SELECT servicio_id
        FROM servicio
        WHERE servicio_id = ${id}
        LIMIT 1
      `);

      if (!existe.length) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const rows = await tx.$queryRaw<
        Array<{
          servicio_id: bigint;
          codigo: string;
          nombre: string;
          descripcion: string;
          precio_base: string;
          duracion_estimada_min: number;
          activo: boolean;
        }>
      >(Prisma.sql`
        UPDATE servicio
        SET activo = ${activo}
        WHERE servicio_id = ${id}
        RETURNING
          servicio_id,
          codigo,
          nombre,
          descripcion,
          precio_base,
          duracion_estimada_min,
          activo
      `);

      const s = rows[0];
      return {
        id: Number(s.servicio_id),
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precioBase: Number(s.precio_base),
        duracionEstimadaMin: s.duracion_estimada_min,
        activo: s.activo,
      };
    });
  }

  // === Listar servicios del taller con filtros ===
  async listar(
    slugTaller: string,
    params: { q?: string; activo?: boolean },
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const conditions: Prisma.Sql[] = [];

      if (typeof params.activo === 'boolean') {
        conditions.push(
          Prisma.sql`activo = ${params.activo}`,
        );
      }

      if (params.q && params.q.trim()) {
        const like = `%${params.q.trim()}%`;
        conditions.push(
          Prisma.sql`(
            codigo ILIKE ${like}
            OR nombre ILIKE ${like}
            OR descripcion ILIKE ${like}
          )`,
        );
      }

      const whereSql =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(
              conditions,
              ' AND ',
            )}`
          : Prisma.sql``;

      const rows = await tx.$queryRaw<
        Array<{
          servicio_id: bigint;
          codigo: string;
          nombre: string;
          descripcion: string;
          precio_base: string;
          duracion_estimada_min: number;
          activo: boolean;
        }>
      >(Prisma.sql`
        SELECT
          servicio_id,
          codigo,
          nombre,
          descripcion,
          precio_base,
          duracion_estimada_min,
          activo
        FROM servicio
        ${whereSql}
        ORDER BY activo DESC, nombre ASC
      `);

      return rows.map((s) => ({
        id: Number(s.servicio_id),
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precioBase: Number(s.precio_base),
        duracionEstimadaMin: s.duracion_estimada_min,
        activo: s.activo,
      }));
    });
  }

  // === Detalle de servicio + mecánicos asociados ===
  async detalle(slugTaller: string, id: number) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const baseRows = await tx.$queryRaw<
        Array<{
          servicio_id: bigint;
          codigo: string;
          nombre: string;
          descripcion: string;
          precio_base: string;
          duracion_estimada_min: number;
          activo: boolean;
        }>
      >(Prisma.sql`
        SELECT
          servicio_id,
          codigo,
          nombre,
          descripcion,
          precio_base,
          duracion_estimada_min,
          activo
        FROM servicio
        WHERE servicio_id = ${id}
        LIMIT 1
      `);

      if (!baseRows.length) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const s = baseRows[0];

      const mecRows = await tx.$queryRaw<
        Array<{
          mecanico_id: bigint;
          nombres: string;
          apellidos: string;
          email: string;
        }>
      >(Prisma.sql`
        SELECT
          sm.mecanico_usuario_id AS mecanico_id,
          u.nombres,
          u.apellidos,
          u.email
        FROM servicio_mecanico sm
        JOIN usuario u
          ON u.usuario_id = sm.mecanico_usuario_id
        WHERE sm.servicio_id = ${id}
      `);

      const mecanicos = mecRows.map((m) => ({
        mecanicoId: Number(m.mecanico_id),
        nombre: `${m.nombres} ${m.apellidos}`.trim(),
        email: m.email,
      }));

      return {
        id: Number(s.servicio_id),
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precioBase: Number(s.precio_base),
        duracionEstimadaMin: s.duracion_estimada_min,
        activo: s.activo,
        totalMecanicosHabilitados: mecanicos.length,
        mecanicosHabilitados: mecanicos,
      };
    });
  }

  // === Habilitar / deshabilitar mecánico para un servicio ===
  async setHabilitacion(
    slugTaller: string,
    servicioId: number,
    mecanicoId: number,
    habilitado: boolean,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      // Verificar servicio
      const servicioRows = await tx.$queryRaw<
        Array<{ servicio_id: bigint; activo: boolean }>
      >(Prisma.sql`
        SELECT servicio_id, activo
        FROM servicio
        WHERE servicio_id = ${servicioId}
        LIMIT 1
      `);

      if (!servicioRows.length) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const servicioActivo = servicioRows[0].activo;
      if (!servicioActivo && habilitado) {
        throw new BadRequestException(
          'No se pueden habilitar mecánicos en un servicio inactivo',
        );
      }

      // Verificar usuario existe
      const mecRows = await tx.$queryRaw<
        Array<{ usuario_id: bigint }>
      >(Prisma.sql`
        SELECT usuario_id
        FROM usuario
        WHERE usuario_id = ${mecanicoId}
        LIMIT 1
      `);

      if (!mecRows.length) {
        throw new BadRequestException('Mecánico no existe');
      }

      // Verificar rol MECANICO vía usuario_rol + app.rol
      const rolRows = await tx.$queryRaw<
        Array<{ tiene: boolean }>
      >(Prisma.sql`
        SELECT TRUE AS tiene
        FROM usuario_rol ur
        JOIN rol r
          ON r.rol_id = ur.rol_id
        WHERE
          ur.usuario_id = ${mecanicoId}
          AND r.codigo = 'MECANICO'
        LIMIT 1
      `);

      if (!rolRows.length) {
        throw new BadRequestException(
          'El usuario no tiene rol MECANICO',
        );
      }

      if (habilitado) {
        // Inserta si no existe (idempotente)
        await tx.$queryRaw(Prisma.sql`
          INSERT INTO servicio_mecanico (
            servicio_id,
            mecanico_usuario_id
          )
          VALUES (
            ${servicioId},
            ${mecanicoId}
          )
          ON CONFLICT (servicio_id, mecanico_usuario_id)
          DO NOTHING
        `);

        return {
          servicioId,
          mecanicoId,
          habilitado: true,
        };
      } else {
        // Elimina si existe
        await tx.$queryRaw(Prisma.sql`
          DELETE FROM servicio_mecanico
          WHERE
            servicio_id = ${servicioId}
            AND mecanico_usuario_id = ${mecanicoId}
        `);

        return {
          servicioId,
          mecanicoId,
          habilitado: false,
        };
      }
    });
  }

  // === Listar mecánicos habilitados de un servicio ===
  async listarMecanicosHabilitados(
    slugTaller: string,
    servicioId: number,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      const existeServ = await tx.$queryRaw<
        Array<{ servicio_id: bigint }>
      >(Prisma.sql`
        SELECT servicio_id
        FROM servicio
        WHERE servicio_id = ${servicioId}
        LIMIT 1
      `);

      if (!existeServ.length) {
        throw new NotFoundException('Servicio no encontrado');
      }

      const rows = await tx.$queryRaw<
        Array<{
          mecanico_id: bigint;
          nombres: string;
          apellidos: string;
          email: string;
        }>
      >(Prisma.sql`
        SELECT
          sm.mecanico_usuario_id AS mecanico_id,
          u.nombres,
          u.apellidos,
          u.email
        FROM servicio_mecanico sm
        JOIN usuario u
          ON u.usuario_id = sm.mecanico_usuario_id
        WHERE sm.servicio_id = ${servicioId}
        ORDER BY u.nombres, u.apellidos
      `);

      return rows.map((m) => ({
        mecanicoId: Number(m.mecanico_id),
        nombre: `${m.nombres} ${m.apellidos}`.trim(),
        email: m.email,
      }));
    });
  }
}
