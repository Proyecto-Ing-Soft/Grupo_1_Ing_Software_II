// src/citas/citas.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { Notificador } from '../notificiaciones/envio/notificador';

export type EstadoCita = 'SOLICITADA' | 'ACEPTADA' | 'EN_PROGRESO' | 'TERMINADA';

/** Convierte YYYY-MM-DD a Date (00:00 hora local) */
function toLocalMidnight(dateYYYYMMDD: string): Date {
  return new Date(`${dateYYYYMMDD}T00:00:00`);
}

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificador: Notificador, // viene de NotificacionesModule
  ) {}

  /** Crea una cita y notifica al mecánico (y opcionalmente al cliente). */
  async crear(dto: CrearCitaDto, clienteId: number) {
    // 1) Validar que el vehículo pertenezca al cliente
    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
      select: { id: true, placa: true },
    });
    if (!vehiculo) throw new ForbiddenException('Ese vehículo no te pertenece');

    // 2) Normalizar fecha (solo fecha, sin hora)
    const programada =
      dto.programadaPara && dto.programadaPara.trim().length >= 8
        ? toLocalMidnight(dto.programadaPara.trim())
        : null;

    // 3) Crear cita
    const cita = await this.prisma.citaMantenimiento.create({
      data: {
        tipo: dto.tipo as any, // enum Prisma
        comentario: dto.comentario.trim(),
        programadaPara: programada,
        clienteId,
        vehiculoId: dto.vehiculoId,
        mecanicoId: dto.mecanicoId,
      },
      include: {
        vehiculo: { select: { placa: true } },
        mecanico: { select: { id: true, nombreCompleto: true } },
      },
    });

    // 4) Notificar al MECÁNICO asignado
    await this.notificador.enviar({
      usuarioId: dto.mecanicoId,
      vehiculoId: vehiculo.id,
      citaId: cita.id,
      mensaje: `Nueva cita #${cita.id} (${dto.tipo}) para el vehículo ${vehiculo.placa}.`,
      prioridad: 'MEDIA',
    });

    // (Opcional) Notificar al CLIENTE que la cita fue registrada
    await this.notificador.enviar({
      usuarioId: clienteId,
      vehiculoId: vehiculo.id,
      citaId: cita.id,
      mensaje: `Tu cita #${cita.id} fue registrada.`,
      prioridad: 'MEDIA',
    });

    return cita;
  }

  /** Citas del cliente autenticado */
  listarPorCliente(clienteId: number) {
    return this.prisma.citaMantenimiento.findMany({
      where: { clienteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        vehiculo: true,
        mecanico: { select: { id: true, nombreCompleto: true } },
      },
    });
  }

  /** Citas asignadas al mecánico (pendientes/progreso) */
  listarPorMecanico(mecanicoId: number) {
    return this.prisma.citaMantenimiento.findMany({
      where: {
        mecanicoId,
        estado: { in: ['SOLICITADA', 'ACEPTADA', 'EN_PROGRESO'] as any },
      },
      orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
      include: {
        vehiculo: true,
        cliente: { select: { id: true, nombreCompleto: true, correo: true } },
      },
    });
  }

  /** Cambia el estado de una cita (mecánico asignado) y notifica al cliente */
  async cambiarEstado(
    id: number,
    mecanicoId: number,
    nuevo: EstadoCita,
    permitidos: EstadoCita[],
  ) {
    const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id } });
    if (!cita) throw new NotFoundException('Cita no encontrada');

    if (cita.mecanicoId !== mecanicoId) {
      throw new ForbiddenException('No eres el mecánico asignado');
    }

    if (!permitidos.includes(cita.estado as EstadoCita)) {
      throw new BadRequestException(
        `Transición no permitida desde ${cita.estado} a ${nuevo}`,
      );
    }

    const actualizada = await this.prisma.citaMantenimiento.update({
      where: { id },
      data: { estado: nuevo as any },
    });

    const msgPorEstado: Record<EstadoCita, string> = {
      SOLICITADA: 'Tu cita fue registrada.',
      ACEPTADA: 'Tu cita fue aceptada. 🔵',
      EN_PROGRESO: 'Tu mantenimiento está en progreso. 🟣',
      TERMINADA: 'Mantenimiento terminado. ✅',
    };

    // Notifica al CLIENTE el cambio de estado
    await this.notificador.enviar({
      usuarioId: actualizada.clienteId,
      vehiculoId: actualizada.vehiculoId,
      citaId: actualizada.id,
      mensaje: `Cita #${id}: ${msgPorEstado[nuevo]}`,
      prioridad: 'MEDIA',
    });

    return actualizada;
  }
}
