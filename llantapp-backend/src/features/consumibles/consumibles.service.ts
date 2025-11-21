// PRINCIPIOS: 
// - SRP: lógica de negocio del inventario (stock, mínimos, notificaciones).
// - KISS: reglas claras y aisladas.
// - DRY: helpers reutilizables para shape de respuesta y notificaciones.

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { CrearConsumibleDto } from './dto/crear-consumible.dto';
import { ActualizarConsumibleDto } from './dto/actualizar-consumible.dto';
import { Notificador } from '../notificaciones/notificaciones/envio/notificador';

@Injectable()
export class ConsumiblesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly noti: Notificador, // US-14: alertas de stock bajo
  ) {}

  // ------------------------
  // HELPER: shape para UI
  // ------------------------
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

  // ------------------------------------------
  // US-14: Notificar a ADMIN si el stock es bajo
  // ------------------------------------------
  private async notificarBajoInventario(c: {
    id: number;
    nombre: string;
    unidad: string;
    stockActual: number;
    stockMinimo: number;
    activo: boolean;
  }) {
    if (!c.activo) return;
    if (c.stockActual > c.stockMinimo) return; // stock OK → nada

    const admins = await this.prisma.usuario.findMany({
      where: { rol: 'ADMIN' },
      select: { id: true },
    });

    if (!admins.length) return;

    const msg = `El consumible "${c.nombre}" tiene stock bajo: ${c.stockActual} ${c.unidad} (mínimo recomendado: ${c.stockMinimo}).`;

    await Promise.all(
      admins.map((a) =>
        this.noti.enviar({
          usuarioId: a.id,
          // citaId y vehiculoId son opcionales, así que simplemente no los mandamos
          titulo: 'Alerta: stock bajo de consumible',
          mensaje: msg,
        }),
      ),
    );
  }

  // ==============
  // LISTAR (ADMIN)
  // ==============
  async listar() {
    const filas = await this.prisma.consumible.findMany({
      orderBy: { nombre: 'asc' },
    });
    return filas.map((c) => this.toView(c));
  }

  async buscarPorId(id: number) {
    const c = await this.prisma.consumible.findUnique({ where: { id } });
    if (!c) throw new BadRequestException('Consumible no existe');
    return this.toView(c);
  }

  // ==========
  // CREAR
  // ==========
  async crear(dto: CrearConsumibleDto) {
    const nombreNorm = dto.nombre.trim();

    const existe = await this.prisma.consumible.findUnique({
      where: { nombre: nombreNorm },
    });
    if (existe) {
      throw new BadRequestException('Ya existe un consumible con ese nombre');
    }

    const creado = await this.prisma.consumible.create({
      data: {
        nombre: nombreNorm,
        unidad: dto.unidad.trim(),
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        descripcion: dto.descripcion?.trim() || null,
        activo: dto.activo ?? true,
      },
    });

    // US-14: si nace ya bajo mínimo → notificar
    await this.notificarBajoInventario(creado);

    return this.toView(creado);
  }

  // ==========
  // ACTUALIZAR
  // ==========
  async actualizar(id: number, dto: ActualizarConsumibleDto) {
    const actual = await this.prisma.consumible.findUnique({ where: { id } });
    if (!actual) throw new BadRequestException('Consumible no existe');

    // Validar nombre duplicado
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

    // US-14: notificar si quedó bajo
    await this.notificarBajoInventario(actualizado);

    return this.toView(actualizado);
  }

  // ==========
  // ELIMINAR
  // ==========
  async eliminar(id: number) {
    await this.prisma.consumible.delete({ where: { id } });
    return { ok: true };
  }

  // =================================================
  // LISTAR ACTIVOS (LITE) - usado por MECÁNICO (US-20)
  // =================================================
  async listarActivosLite() {
    const filas = await this.prisma.consumible.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        unidad: true,
        stockActual: true,
        stockMinimo: true,
      },
      orderBy: [{ nombre: 'asc' }],
    });

    return filas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      unidad: f.unidad,
      stockActual: f.stockActual,
      stockMinimo: f.stockMinimo,
    }));
  }

  // =========================================
  // US-20: CONSUMIR STOCK EN MANTENIMIENTO
  // =========================================
  async consumirEnMantenimiento(
    items: { consumibleId: number; cantidad: number }[],
  ) {
    if (!items?.length) return;

    // Agrupar por consumibleId
    const porConsumible = new Map<number, number>();
    for (const it of items) {
      const id = Number(it.consumibleId);
      const qty = Number(it.cantidad);
      if (!Number.isFinite(id) || !Number.isFinite(qty) || qty <= 0) continue;
      porConsumible.set(id, (porConsumible.get(id) ?? 0) + qty);
    }

    if (!porConsumible.size) return;

    const ids = [...porConsumible.keys()];
    const consumibles = await this.prisma.consumible.findMany({
      where: { id: { in: ids } },
    });

    if (consumibles.length !== ids.length) {
      throw new BadRequestException('Algún consumible no existe');
    }

    // Validar stock
    for (const c of consumibles) {
      const solicitado = porConsumible.get(c.id)!;
      if (solicitado > c.stockActual) {
        throw new BadRequestException(
          `Stock insuficiente para "${c.nombre}". Disponible: ${c.stockActual}, solicitado: ${solicitado}`,
        );
      }
    }

    // Actualizar stock
    const actualizados = await this.prisma.$transaction(
      consumibles.map((c) => {
        const usado = porConsumible.get(c.id)!;
        return this.prisma.consumible.update({
          where: { id: c.id },
          data: { stockActual: c.stockActual - usado },
        });
      }),
    );

    // US-14: notificar si después del descuento quedó bajo mínimo
    await Promise.all(
      actualizados.map((c) => this.notificarBajoInventario(c)),
    );
  }
}
