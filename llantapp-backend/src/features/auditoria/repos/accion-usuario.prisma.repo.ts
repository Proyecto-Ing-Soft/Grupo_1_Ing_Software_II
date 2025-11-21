import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';

@Injectable()
export class AccionUsuarioPrismaRepo {
  constructor(private readonly prisma: PrismaService) {}

  crear(input: {
    usuarioId: number;
    tipo: string;
    descripcion: string;
    citaId?: number | null;
    mecanicoId?: number | null;
  }) {
    return this.prisma.accionUsuario.create({
      data: {
        usuarioId: input.usuarioId,
        tipo: input.tipo,
        descripcion: input.descripcion,
        citaId: input.citaId ?? null,
        mecanicoId: input.mecanicoId ?? null,
      },
    });
  }

  listarUltimas(limit = 50) {
    return this.prisma.accionUsuario.findMany({
      take: limit,
      orderBy: { creadoEn: 'desc' },
      include: {
        usuario: { select: { id: true, nombreCompleto: true, rol: true } },
        cita: {
          select: {
            id: true,
            fechaMantenimiento: true,
            programadaPara: true,
          },
        },
      },
    });
  }
}
