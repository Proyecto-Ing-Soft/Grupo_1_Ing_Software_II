import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';

// SRP: servicio dedicado solo a registrar acciones de usuario en la bitácora.
export interface RegistrarAccionDto {
  usuarioId: number;
  tipo: string;           // p.ej. "CREAR_CITA", "ASIGNAR_MECANICO", "TERMINAR_CITA"
  citaId?: number;
  mecanicoId?: number;
  descripcion: string;
}

@Injectable()
export class AccionesAuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

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
}
