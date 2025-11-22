import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';

// SRP: servicio dedicado solo a registrar y leer acciones de usuario en la bitácora.

export interface RegistrarAccionDto {
  usuarioId: number;
  tipo: string; // p.ej. "CREAR_CITA", "ASIGNAR_MECANICO", "TERMINAR_CITA"
  citaId?: number;
  mecanicoId?: number;
  descripcion: string;
}

@Injectable()
export class AccionesAuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================
  // Registrar acción en bitácora
  // ==========================
  async registrarAccion(dto: RegistrarAccionDto): Promise<void> {
    await this.prisma.accionUsuario.create({
      data: {
        usuarioId: dto.usuarioId,
        tipo: dto.tipo,
        citaId: dto.citaId ?? null,
        mecanicoId: dto.mecanicoId ?? null,
        descripcion: dto.descripcion,
      },
    });
  }

  // ==========================
  // Listar acciones (bitácora)
  // ==========================
  async listar(params: { citaId?: number; limit?: number }) {
    const take = Math.min(Math.max(params.limit || 50, 1), 200);

    const where: any = {};
    if (params.citaId && !Number.isNaN(params.citaId)) {
      where.citaId = params.citaId;
    }

    const filas = await this.prisma.accionUsuario.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      take,
      include: {
        usuario: { select: { id: true, nombreCompleto: true } },
        cita: {
          select: {
            id: true,
            estado: true,
            servicio: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    // Shape amigable para el FE
    return filas.map((f) => ({
      id: f.id,
      tipo: f.tipo, // tipo de ACCIÓN (CREAR_CITA, ASIGNAR_MECANICO, etc.)
      descripcion: f.descripcion,
      creadoEn: f.creadoEn.toISOString(),
      usuario: f.usuario, // viene del include
      cita: f.cita
        ? {
          id: f.cita.id,
          estado: f.cita.estado,
          servicio: f.cita.servicio,
          // compat: antes la cita tenía "tipo", ahora derivamos del servicio
          tipo: f.cita.servicio?.nombre ?? '—',
        }
        : null,
      mecanicoId: f.mecanicoId ?? null,
    }));
  }
}
