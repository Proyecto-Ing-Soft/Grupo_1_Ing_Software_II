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
  // HELPERS USUARIO / TALLER
  // ------------------------
  private async getUsuarioConTaller(usuarioId: number) {
    const u = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        rol: true,
        tallerId: true,
      },
    });

    if (!u) {
      throw new BadRequestException('Usuario no encontrado');
    }

    return u;
  }

  /**
   * Obliga a que el usuario tenga tallerId (ADMIN de taller).
   * Si es OWNER sin taller, lanza error en las operaciones de inventario.
   */
  private ensureTallerId(u: { tallerId: number | null }) {
    if (u.tallerId == null) {
      throw new BadRequestException(
        'El usuario no está asociado a ningún taller.',
      );
    }
    return u.tallerId; // ahora es number
  }

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
    tallerId: number;
  }) {
    if (!c.activo) return;
    if (c.stockActual > c.stockMinimo) return; // stock OK → nada

    // Notificar a todos los ADMIN de ese taller
    const admins = await this.prisma.usuario.findMany({
      where: {
        rol: 'ADMIN',
        tallerId: c.tallerId,
      },
      select: { id: true },
    });

    if (!admins.length) return;

    const msg = `El consumible "${c.nombre}" tiene stock bajo: ${c.stockActual} ${c.unidad} (mínimo recomendado: ${c.stockMinimo}).`;

    await Promise.all(
      admins.map((a) =>
        this.noti.enviar({
          usuarioId: a.id,
          titulo: 'Alerta: stock bajo de consumible',
          mensaje: msg,
        }),
      ),
    );
  }

  // ==============
  // LISTAR (ADMIN)
  // ==============
  async listar(adminId: number) {
    const admin = await this.getUsuarioConTaller(adminId);
    const tallerId = this.ensureTallerId(admin);

    const filas = await this.prisma.consumible.findMany({
      where: { tallerId },
      orderBy: { nombre: 'asc' },
    });
    return filas.map((c) => this.toView(c));
  }

  async buscarPorId(id: number, adminId: number) {
    const admin = await this.getUsuarioConTaller(adminId);
    const tallerId = this.ensureTallerId(admin);

    const c = await this.prisma.consumible.findFirst({
      where: { id, tallerId },
    });
    if (!c) throw new BadRequestException('Consumible no existe');
    return this.toView(c);
  }

  // ==========
  // CREAR
  // ==========
  async crear(adminId: number, dto: CrearConsumibleDto) {
    const admin = await this.getUsuarioConTaller(adminId);
    const tallerId = this.ensureTallerId(admin);

    const nombreNorm = dto.nombre.trim();

    const existe = await this.prisma.consumible.findFirst({
      where: { tallerId, nombre: nombreNorm },
    });
    if (existe) {
      throw new BadRequestException(
        'Ya existe un consumible con ese nombre en este taller',
      );
    }

    const creado = await this.prisma.consumible.create({
      data: {
        nombre: nombreNorm,
        unidad: dto.unidad.trim(),
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        descripcion: dto.descripcion?.trim() || null,
        activo: dto.activo ?? true,
        tallerId, // ⬅️ ya es number, no puede ser null
      },
    });

    // US-14: si nace ya bajo mínimo → notificar
    await this.notificarBajoInventario(creado);

    return this.toView(creado);
  }

  // ==========
  // ACTUALIZAR
  // ==========
  async actualizar(id: number, adminId: number, dto: ActualizarConsumibleDto) {
    const admin = await this.getUsuarioConTaller(adminId);
    const tallerId = this.ensureTallerId(admin);

    const actual = await this.prisma.consumible.findFirst({
      where: { id, tallerId },
    });
    if (!actual) {
      throw new BadRequestException(
        'Consumible no existe en el taller del administrador',
      );
    }

    // Validar nombre duplicado dentro del mismo taller
    if (dto.nombre && dto.nombre.trim() !== actual.nombre) {
      const duplicado = await this.prisma.consumible.findFirst({
        where: { tallerId, nombre: dto.nombre.trim() },
      });
      if (duplicado) {
        throw new BadRequestException(
          'Ya existe otro consumible con ese nombre en este taller',
        );
      }
    }

    const actualizado = await this.prisma.consumible.update({
      where: { id: actual.id },
      data: {
        ...(dto.nombre ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.unidad ? { unidad: dto.unidad.trim() } : {}),
        ...(dto.stockActual != null ? { stockActual: dto.stockActual } : {}),
        ...(dto.stockMinimo != null ? { stockMinimo: dto.stockMinimo } : {}),
        ...(dto.descripcion != null
          ? { descripcion: dto.descripcion.trim() }
          : {}),
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
  async eliminar(id: number, adminId: number) {
    const admin = await this.getUsuarioConTaller(adminId);
    const tallerId = this.ensureTallerId(admin);

    const existente = await this.prisma.consumible.findFirst({
      where: { id, tallerId },
    });
    if (!existente) {
      throw new BadRequestException(
        'Consumible no existe en el taller del administrador',
      );
    }

    await this.prisma.consumible.delete({ where: { id: existente.id } });
    return { ok: true };
  }

  // =================================================
  // LISTAR ACTIVOS (LITE) - usado por MECÁNICO (US-20)
  // =================================================
  async listarActivosLite(usuarioId: number) {
    const usuario = await this.getUsuarioConTaller(usuarioId);

    const where: any = { activo: true };

    // Si el usuario pertenece a un taller → filtrar por ese taller.
    // Si es OWNER sin tallerId → ve todo.
    if (usuario.tallerId != null) {
      where.tallerId = usuario.tallerId;
    }

    const filas = await this.prisma.consumible.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        unidad: true,
        stockActual: true,
        stockMinimo: true,
        activo: true,
        tallerId: true,
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
