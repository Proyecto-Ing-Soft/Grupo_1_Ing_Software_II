import { Injectable, BadRequestException } from '@nestjs/common';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { EnviarPromocionDto } from './dto/enviar-promocion.dto';

// SRP + Facade: interfaz simple para publicar notificaciones desde el dominio
export interface EnvioNotificacion {
  usuarioId: number;
  titulo: string;
  mensaje: string;
  vehiculoId?: number;
  citaId?: number;
}

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly repo: NotificacionPrismaRepo,
    private readonly prisma: PrismaService, // ⬅ necesario para obtener clientes
  ) {}

  async enviar(data: EnvioNotificacion): Promise<void> {
    const cuerpo = `${data.titulo}: ${data.mensaje}`;
    await this.repo.crear({
      usuarioId: data.usuarioId,
      mensaje: cuerpo,
      vehiculoId: data.vehiculoId,
      citaId: data.citaId,
    });
  }

  async listarPorUsuario(usuarioId: number) {
    const filas = await this.repo.listarPorUsuario(usuarioId);
    return filas.map(n => ({
      id: n.id,
      mensaje: n.mensaje,
      estado: n.estado,
      creadoEn: n.creadoEn.toISOString(),
      vehiculoId: n.vehiculoId ?? null,
      citaId: n.citaId ?? null,
    }));
  }

  async marcarLeida(id: number, usuarioId: number) {
    await this.repo.marcarLeida(id, usuarioId);
    return { ok: true };
  }

  // ============================================================
  // === NUEVO MÉTODO — US-04: enviar promoción a todos clientes ===
  // ============================================================

  async enviarPromocionATodosClientes(dto: EnviarPromocionDto) {
    if (!dto.titulo?.trim() || !dto.mensaje?.trim()) {
      throw new BadRequestException('Título y mensaje son obligatorios');
    }

    // ─────────────────────────────────────────────
    // 1) Caso seleccion de usuarios
    // ─────────────────────────────────────────────
    if (dto.usuarios && dto.usuarios.length > 0) {
      // Validar IDs positivos
      const idsValidos = dto.usuarios.filter(id => Number(id) > 0);
      if (idsValidos.length === 0) {
        throw new BadRequestException('La lista de usuarios no es válida');
      }

      await Promise.all(
        idsValidos.map(uid =>
          this.repo.crear({
            usuarioId: uid,
            mensaje: `${dto.titulo}: ${dto.mensaje}`,
            vehiculoId: null,
            citaId: null,
          })
        )
      );

      return { enviados: idsValidos.length, modo: 'selectivo' };
    }

    // ─────────────────────────────────────────────
    // 2) Caso Envío masivo a todos los clientes
    // ─────────────────────────────────────────────
    const clientes = await this.prisma.usuario.findMany({
      where: { rol: 'CLIENTE' },
      select: { id: true },
    });

    if (clientes.length === 0) return { enviados: 0, modo: 'todos' };

    await Promise.all(
      clientes.map(c =>
        this.repo.crear({
          usuarioId: c.id,
          mensaje: `${dto.titulo}: ${dto.mensaje}`,
          vehiculoId: null,
          citaId: null,
        })
      )
    );

    return { enviados: clientes.length, modo: 'todos' };
  }
}
