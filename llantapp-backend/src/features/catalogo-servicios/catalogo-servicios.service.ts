// PRINCIPIOS/PATRONES
// - SRP: reglas del catálogo + habilitaciones.
// - KISS: validaciones y mensajes claros.
// - OCP: list/detalle/upsert habilitación facilitan crecer.
// - Prisma: manejo de P2002 (unique violation en nombre).

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
    const nombre = dto.nombre.trim();
    const descripcion = dto.descripcion.trim();
    if (!nombre) throw new BadRequestException('El nombre no puede estar vacío');
    if (!descripcion) throw new BadRequestException('La descripción no puede estar vacía');

    try {
      return await this.prisma.servicio.create({
        data: {
          nombre,
          descripcion,
          activo: dto.activo ?? true,
          precioSugerido: dto.precioSugerido ?? null,
          duracionMinutos: dto.duracionMinutos ?? null,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Ya existe un servicio con ese nombre');
      }
      throw e;
    }
  }

  // === Actualizar ===
  async actualizar(id: number, dto: ActualizarServicioDto) {
    const exists = await this.prisma.servicio.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Servicio no encontrado');

    const data: Prisma.ServicioUpdateInput = {};
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
    if (dto.precioSugerido !== undefined) data.precioSugerido = dto.precioSugerido as any;
    if (dto.duracionMinutos !== undefined) data.duracionMinutos = dto.duracionMinutos;

    try {
      return await this.prisma.servicio.update({ where: { id }, data });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Ya existe un servicio con ese nombre');
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
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.servicio.findMany({
      where,
      orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        precioSugerido: true,
        duracionMinutos: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });
  }

  // === Detalle con conteo de mecánicos habilitados ===
  async detalle(id: number) {
    const s = await this.prisma.servicio.findUnique({
      where: { id },
      include: {
        mecanicosHabilitados: {
          where: { habilitado: true },
          select: { mecanicoId: true },
        },
      },
    });
    if (!s) throw new NotFoundException('Servicio no encontrado');
    const habilitados = s.mecanicosHabilitados.map((x) => x.mecanicoId);
    const { mecanicosHabilitados, ...rest } = s as any;
    return {
      ...rest,
      totalMecanicosHabilitados: habilitados.length,
      mecanicosHabilitados: habilitados,
    };
  }

  // === Upsert de habilitación (ADMIN): valida rol MECANICO y servicio activo ===
  async setHabilitacion(servicioId: number, mecanicoId: number, habilitado: boolean) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    if (!servicio.activo && habilitado) {
      throw new BadRequestException('No puedes habilitar mecánicos en un servicio inactivo');
    }

    const mec = await this.prisma.usuario.findUnique({ where: { id: mecanicoId } });
    if (!mec) throw new BadRequestException('Mecánico no existe');
    if (mec.rol !== 'MECANICO') {
      throw new BadRequestException('El usuario no tiene rol MECANICO');
    }

    // Upsert por PK compuesta (servicioId, mecanicoId)
    return this.prisma.servicioMecanico.upsert({
      where: { servicioId_mecanicoId: { servicioId, mecanicoId } },
      update: { habilitado },
      create: { servicioId, mecanicoId, habilitado },
    });
  }

  // === Listar mecánicos habilitados con datos básicos ===
  async listarMecanicosHabilitados(servicioId: number) {
    const servicio = await this.prisma.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');

    const rows = await this.prisma.servicioMecanico.findMany({
      where: { servicioId, habilitado: true },
      include: { mecanico: { select: { id: true, nombreCompleto: true, correo: true, rol: true } } },
      orderBy: [{ creadoEn: 'desc' }],
    });

    return rows.map((r) => ({
      mecanicoId: r.mecanico.id,
      nombre: r.mecanico.nombreCompleto,
      correo: r.mecanico.correo,
      rol: r.mecanico.rol,
      habilitado: r.habilitado,
      desde: r.creadoEn,
    }));
  }
}
