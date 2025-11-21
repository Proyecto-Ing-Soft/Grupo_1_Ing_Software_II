// PRINCIPIOS:
// - SRP: manejar solo lógica de inventario de consumibles.
// - KISS: CRUD básico; sin mezclar HTTP ni detalles de UI.
// - DRY: mapeo a shape de respuesta en helpers pequeños.

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { CrearConsumibleDto } from './dto/crear-consumible.dto';
import { ActualizarConsumibleDto } from './dto/actualizar-consumible.dto';

@Injectable()
export class ConsumiblesService {
  constructor(private readonly prisma: PrismaService) {}

  private toView(c: any) {
    return {
      id: c.id,
      nombre: c.nombre,
      unidad: c.unidad,
      stockActual: c.stockActual,
      stockMinimo: c.stockMinimo,
      descripcion: c.descripcion ?? null,
      activo: c.activo,
      creadoEn: c.creadoEn.toISOString(),
      actualizadoEn: c.actualizadoEn.toISOString(),
    };
  }

  async listarTodos() {
    const filas = await this.prisma.consumible.findMany({
      orderBy: { nombre: 'asc' },
    });
    return filas.map(this.toView);
  }

  async buscarPorId(id: number) {
    const c = await this.prisma.consumible.findUnique({ where: { id } });
    if (!c) throw new BadRequestException('Consumible no existe');
    return this.toView(c);
  }

  async crear(dto: CrearConsumibleDto) {
    const existe = await this.prisma.consumible.findUnique({
      where: { nombre: dto.nombre.trim() },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un consumible con ese nombre');
    }

    const creado = await this.prisma.consumible.create({
      data: {
        nombre: dto.nombre.trim(),
        unidad: dto.unidad.trim(),
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        descripcion: dto.descripcion?.trim() || null,
        activo: dto.activo ?? true,
      },
    });

    return this.toView(creado);
  }

  async actualizar(id: number, dto: ActualizarConsumibleDto) {
    const actual = await this.prisma.consumible.findUnique({ where: { id } });
    if (!actual) throw new BadRequestException('Consumible no existe');

    if (dto.nombre && dto.nombre.trim() !== actual.nombre) {
      const duplicado = await this.prisma.consumible.findUnique({
        where: { nombre: dto.nombre.trim() },
      });
      if (duplicado) {
        throw new BadRequestException('Ya existe otro consumible con ese nombre');
      }
    }

    const actualizado = await this.prisma.consumible.update({
      where: { id },
      data: {
        ...(dto.nombre ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.unidad ? { unidad: dto.unidad.trim() } : {}),
        ...(dto.stockActual != null ? { stockActual: dto.stockActual } : {}),
        ...(dto.stockMinimo != null ? { stockMinimo: dto.stockMinimo } : {}),
        ...(dto.descripcion != null ? { descripcion: dto.descripcion.trim() } : {}),
        ...(dto.activo != null ? { activo: dto.activo } : {}),
      },
    });

    return this.toView(actualizado);
  }

  async eliminar(id: number) {
    // Puedes cambiar esto a "soft delete" (activo=false) si prefieres
    await this.prisma.consumible.delete({ where: { id } });
    return { ok: true };
  }
}
