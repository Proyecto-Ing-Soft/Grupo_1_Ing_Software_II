// PRINCIPIOS/PATRONES
// - SRP: reglas del catálogo + asociaciones mecánico-servicio.
// - KISS: validaciones/mensajes claros.
// - OCP: filtros básicos; insert/delete en pivote para habilitar.
// - Prisma: manejo de P2002 (unique violation en codigo/nombre).

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { ActualizarServicioDto, CrearServicioDto } from './dto/servicio.dto';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CatalogoServiciosService {
  constructor(private prisma: PrismaService) {}

  // === Crear ===
  async crear(dto: CrearServicioDto) {
    const codigo = dto.codigo.trim().toUpperCase();
    const nombre = dto.nombre.trim();
    const descripcion = dto.descripcion.trim();

    if (!codigo) throw new BadRequestException('El código no puede estar vacío');
    if (!nombre) throw new BadRequestException('El nombre no puede estar vacío');
    if (!descripcion) throw new BadRequestException('La descripción no puede estar vacía');

    try {
      return await this.prisma.servicio.create({
        data: {
          codigo,
          nombre,
          descripcion,
          activo: dto.activo ?? true,
          precioBase: dto.precioBase,
          duracionEstimadaMin: dto.duracionEstimadaMin,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        // Unique en codigo (y/o nombre si lo mapeaste como unique)
        throw new BadRequestException('Ya existe un servicio con ese código o nombre');
      }
      throw e;
    }
  }

  // === Actualizar ===
  async actualizar(id: number, dto: ActualizarServicioDto) {
    const exists = await this.prisma.servicio.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Servicio no encontrado');

    const data: Prisma.ServicioUpdateInput = {};
    if (dto.codigo !== undefined) {
      const codigo = dto.codigo.trim().toUpperCase();
      if (!codigo) throw new BadRequestException('El código no puede estar vacío');
      (data as any).codigo = codigo;
    }
    if (dto.nombre !== undefined) {
      const nombre = dto.nombre.trim();
      if (!nombre) throw new BadRequestException('El nombre no puede estar vacío');
      data.nombre = nombre;
    }
    if (dto.descripcion !== undefined) {
      const desc = dto.descripcion.trim();
      if (!desc) throw new BadRequestException('La descripción no puede estar vacía');
      data.descripcion = desc;
    }
    if (dto.activo !== undefined) data.activo = dto.activo;
    if (dto.precioBase !== undefined) (data as any).precioBase = dto.precioBase;
    if (dto.duracionEstimadaMin !== undefined)
      (data as any).duracionEstimadaMin = dto.duracionEstimadaMin;

    try {
      return await this.prisma.servicio.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Ya existe un servicio con ese código o nombre');
      }
      throw e;
    }
  }

  // === Activar/Inactivar ===
  async cambiarEstado(id: number, activo: boolean) {
    const s = await this.prisma.servicio.findUnique({ where: { id } });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.servicio.update({ where: { id }, data: { activo } });
  }

  // === Listar con filtros básicos ===
  async listar(params: { q?: string; activo?: boolean }) {
    const where: Prisma.ServicioWhereInput = {};
    if (typeof params.activo === 'boolean') where.activo = params.activo;
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.servicio.findMany({
      where,
      orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        activo: true,
        precioBase: true,
        duracionEstimadaMin: true,
      },
    });
  }

  // === Detalle con lista de mecánicos asociados ===
  async detalle(id: number) {
    const s = await this.prisma.servicio.findUnique({
      where: { id },
      include: {
        servicioMecanico: { select: { mecanicoId: true } }, // pivote sin "habilitado"
      },
    });
    if (!s) throw new NotFoundException('Servicio no encontrado');

    const mecanicos = s.servicioMecanico.map((x) => x.mecanicoId);
    const { servicioMecanico, ...rest } = s as any;
    return {
      ...rest,
      totalMecanicosHabilitados: mecanicos.length,
      mecanicosHabilitados: mecanicos,
    };
  }

  // === Insert/Delete en pivote. Valida rol MECANICO vía usuario_rol ===
  async setHabilitacion(servicioId: number, mecanicoId: number, habilitado: boolean) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    if (!servicio.activo && habilitado) {
      throw new BadRequestException('No puedes habilitar mecánicos en un servicio inactivo');
    }

    const mec = await this.prisma.usuario.findUnique({ where: { id: mecanicoId } });
    if (!mec) throw new BadRequestException('Mecánico no existe');

    const tieneRolMecanico = await this.prisma.usuarioRol.findFirst({
      where: { usuarioId: mecanicoId, rol: { codigo: 'MECANICO' } },
      select: { id: true },
    });
    if (!tieneRolMecanico) {
      throw new BadRequestException('El usuario no tiene rol MECANICO');
    }

    if (habilitado) {
      // crea si no existe
      try {
        return await this.prisma.servicioMecanico.create({
          data: { servicioId, mecanicoId },
        });
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
          // ya existía la asociación
          return { servicioId, mecanicoId };
        }
        throw e;
      }
    } else {
      // elimina si existe (deshabilitar)
      await this.prisma.servicioMecanico.deleteMany({
        where: { servicioId, mecanicoId },
      });
      return { servicioId, mecanicoId, eliminado: true };
    }
  }

  // === Listar mecánicos asociados con datos básicos ===
  async listarMecanicosHabilitados(servicioId: number) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');

    const rows = await this.prisma.servicioMecanico.findMany({
      where: { servicioId },
      include: {
        mecanico: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
            usuarioRol: {
              select: { rol: { select: { codigo: true, nombre: true } } },
            },
          },
        },
      },
      // la tabla pivote no tiene timestamps; no se ordena por fecha
    });

    return rows.map((r) => ({
      mecanicoId: r.mecanico.id,
      nombre: `${r.mecanico.nombres} ${r.mecanico.apellidos}`.trim(),
      email: r.mecanico.email,
      roles: r.mecanico.usuarioRol.map((ur) => ur.rol.codigo),
    }));
  }
}
