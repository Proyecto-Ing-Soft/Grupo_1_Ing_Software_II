import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { Notificador } from '../notificaciones/envio/notificador';

// PRINCIPIOS:
// - SRP: orquesta la lógica de negocio de citas (crear, asignar, finalizar, listar).
// - DRY: helpers reutilizables para estados y validación de fechas.
// - DIP: depende de PrismaService y Notificador inyectados (infra desacoplada).

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly noti: Notificador,
  ) {}

  // DRY: obtener el id del estado_cita a partir de su código
  private async getEstadoId(codigo: string): Promise<number> {
    const estado = await this.prisma.estadoCita.findUnique({
      where: { codigo },
    });

    if (!estado) {
      throw new Error(`Estado de cita no configurado: ${codigo}`);
    }

    // Se asume que el modelo Prisma expone "id" como PK
    return (estado as any).id;
  }

  private parseAndValidateFuture(dateIso: string): Date {
    const fecha = new Date(dateIso);
    if (Number.isNaN(fecha.getTime())) {
      throw new BadRequestException('Fecha de cita inválida');
    }
    const ahora = new Date();
    if (fecha.getTime() < ahora.getTime()) {
      throw new BadRequestException(
        'La fecha de la cita debe ser igual o posterior a la actual',
      );
    }
    return fecha;
  }

  // === CREAR CITA ===
  async crear(dto: CrearCitaDto, clienteId: number, slugTaller: string) {
    // Compatibilidad: aceptar fechaProgramada o programadaPara
    const fechaProgramadaIso =
      (dto as any).fechaProgramada ?? (dto as any).programadaPara;
    if (!fechaProgramadaIso) {
      throw new BadRequestException(
        'La fecha programada de la cita es obligatoria',
      );
    }
    const fechaProgramada = this.parseAndValidateFuture(fechaProgramadaIso);

    const vehiculoId = Number((dto as any).vehiculoId);
    const servicioId = Number((dto as any).servicioId);

    if (!vehiculoId) {
      throw new BadRequestException('Debe indicar el vehículo para la cita');
    }
    if (!servicioId) {
      throw new BadRequestException('Debe indicar el servicio para la cita');
    }

    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { id: vehiculoId, propietarioUsuarioId: clienteId },
      select: { id: true, placa: true },
    });
    if (!vehiculo) {
      throw new BadRequestException(
        'El vehículo indicado no pertenece al cliente autenticado',
      );
    }

    const servicio = await this.prisma.servicio.findUnique({
      where: { id: servicioId },
      select: { id: true, nombre: true },
    });
    if (!servicio) {
      throw new BadRequestException('Servicio solicitado no válido');
    }

    const estadoSolicitadaId = await this.getEstadoId('solicitada');

    const cita = await this.prisma.cita.create({
      data: {
        clienteId,
        vehiculoId: vehiculo.id,
        servicioId: servicio.id,
        fechaProgramada,
        estadoCitaId: estadoSolicitadaId,
        comentariosCliente: (dto as any).comentario ?? null,
      },
      include: {
        vehiculo: { select: { placa: true } },
        servicio: { select: { nombre: true } },
      },
    });

    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId: (cita as any).id,
        estadoCitaId: estadoSolicitadaId,
        cambiadoPorUsuarioId: clienteId,
        observacion: 'Creación de cita por el cliente',
      },
    });

    // Notificar a OWNER / ADMIN_TALLER del taller
    const admins = await this.prisma.usuario.findMany({
      where: {
        roles: {
          some: { rol: { codigo: { in: ['ADMIN_TALLER', 'OWNER'] } } },
        },
      },
      select: { id: true },
    });

    await Promise.all(
      admins.map((a: { id: number }) =>
        this.noti.enviar({
          tallerSlug: slugTaller,
          usuarioId: a.id,
          titulo: 'Nueva cita solicitada',
          mensaje: `Se registró la cita #${(cita as any).id} para el vehículo ${(cita as any).vehiculo?.placa ?? ''}.`,
        }),
      ),
    );

    // Notificar cliente
    await this.noti.enviar({
      tallerSlug: slugTaller,
      usuarioId: clienteId,
      titulo: 'Cita registrada',
      mensaje:
        'Tu cita fue registrada correctamente. Te notificaremos cuando se asigne un mecánico.',
    });

    return cita;
  }

  // === ASIGNAR MECÁNICO A CITA ===
  async asignarMecanico(citaId: number, mecanicoId: number, adminId: number, slugTaller: string) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      include: { vehiculo: true },
    });
    if (!cita) {
      throw new NotFoundException('Cita no existe');
    }

    // Desactivar asignaciones previas activas
    await this.prisma.asignacion.updateMany({
      where: { citaId, activo: true },
      data: { activo: false },
    });

    await this.prisma.asignacion.create({
      data: {
        citaId,
        mecanicoUsuarioId: mecanicoId,
        asignadoPorUsuarioId: adminId,
        activo: true,
      },
    });

    const estadoAsignadaId = await this.getEstadoId('asignada');

    await this.prisma.cita.update({
      where: { id: citaId },
      data: {
        estadoCitaId: estadoAsignadaId,
        ultimaActualizacion: new Date(),
      },
    });

    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId,
        estadoCitaId: estadoAsignadaId,
        cambiadoPorUsuarioId: adminId,
        observacion: 'Asignación de mecánico a la cita',
      },
    });

    // Notificar cliente
    await this.noti.enviar({
      tallerSlug: slugTaller,
      usuarioId: (cita as any).clienteId,
      titulo: 'Cita asignada',
      mensaje: 'Tu cita ya cuenta con un mecánico asignado.',
    });

    // Notificar mecánico
    await this.noti.enviar({
      tallerSlug: slugTaller,
      usuarioId: mecanicoId,
      titulo: 'Nueva cita asignada',
      mensaje: `Se te asignó la cita #${citaId}.`,
    });

    return { ok: true };
  }

  // === FINALIZAR CITA (sin entidad mantenimiento) ===
  async finalizar(
    citaId: number,
    mecanicoId: number,
    dto: {
      trabajosRealizados?: string;
      repuestos?: string[];
      evidenciaBase64?: string | null;
    } = {},
    slugTaller: string,
  ) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        vehiculo: true,
        asignaciones: { where: { activo: true } },
      },
    });

    if (!cita) {
      throw new NotFoundException('Cita no existe');
    }

    const asignacionActiva = (cita as any).asignaciones?.[0];
    if (
      !asignacionActiva ||
      asignacionActiva.mecanicoUsuarioId !== mecanicoId
    ) {
      throw new ForbiddenException(
        'El usuario no es el mecánico asignado a esta cita',
      );
    }

    const ahora = new Date();
    if ((cita as any).fechaProgramada > ahora) {
      throw new BadRequestException(
        'Aún no es la fecha programada de la cita',
      );
    }

    const estadoTerminadaId = await this.getEstadoId('terminada');

    // Evidencia opcional asociada directamente a la cita
    if (dto?.evidenciaBase64) {
      const match = /^data:(.+);base64,(.+)$/.exec(dto.evidenciaBase64);
      if (!match) {
        throw new BadRequestException('Formato de evidencia inválido');
      }
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.byteLength > 5 * 1024 * 1024) {
        throw new BadRequestException(
          'La evidencia no debe superar 5MB',
        );
      }

      await this.prisma.evidencia.create({
        data: {
          citaId,
          subidoPorUsuarioId: mecanicoId,
          nombreArchivo: `cita-${citaId}-${Date.now()}`,
          mimeType: mime,
          tamanioBytes: buffer.byteLength,
          bytes: buffer,
          // El tipo de medio concreto se puede resolver en otra capa si se requiere.
        },
      });
    }

    const citaTerminada = await this.prisma.cita.update({
      where: { id: citaId },
      data: {
        estadoCitaId: estadoTerminadaId,
        ultimaActualizacion: ahora,
      },
    });

    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId,
        estadoCitaId: estadoTerminadaId,
        cambiadoPorUsuarioId: mecanicoId,
        observacion: 'Cita finalizada por el mecánico',
      },
    });

    await this.noti.enviar({
      tallerSlug: slugTaller,
      usuarioId: (cita as any).clienteId,
      titulo: 'Cita finalizada',
      mensaje: `La cita asociada al vehículo con placa ${(cita as any).vehiculo?.placa ?? ''} ha sido finalizada.`,
    });

    return citaTerminada;
  }

  // === LISTADOS ===

  async listarDelCliente(clienteId: number) {
    return this.prisma.cita.findMany({
      where: { clienteId },
      include: {
        vehiculo: { select: { placa: true } },
        servicio: { select: { nombre: true } },
        estado: { select: { codigo: true } },
      },
      orderBy: { fechaProgramada: 'desc' },
    });
  }

  async listarDelMecanico(mecanicoId: number) {
    const asignaciones = await this.prisma.asignacion.findMany({
      where: { mecanicoUsuarioId: mecanicoId, activo: true },
      include: {
        cita: {
          include: {
            vehiculo: { select: { placa: true } },
            servicio: { select: { nombre: true } },
            estado: { select: { codigo: true } },
          },
        },
      },
      orderBy: { fechaAsignacion: 'desc' },
    });

    // PRINCIPIO (DRY): reutilizamos la entidad cita devuelta en cada asignación.
    return asignaciones.map((a: any) => a.cita);
  }

  async listarPendientes() {
    const estadoSolicitadaId = await this.getEstadoId('solicitada');

    return this.prisma.cita.findMany({
      where: { estadoCitaId: estadoSolicitadaId },
      include: {
        vehiculo: { select: { placa: true } },
        servicio: { select: { nombre: true } },
        cliente: {
          select: { id: true, nombres: true, apellidos: true },
        },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async buscarPorIdConVehiculo(id: number) {
    return this.prisma.cita.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        servicio: true,
        cliente: {
          select: { id: true, nombres: true, apellidos: true },
        },
        estado: { select: { codigo: true, nombre: true } },
      },
    });
  }

  async obtenerEvidencia(
    citaId: number,
  ): Promise<{ buffer: Buffer; mime: string; nombre: string } | null> {
    const evidencia = await this.prisma.evidencia.findFirst({
      where: { citaId },
      orderBy: { fechaSubida: 'desc' },
    });

    if (!evidencia || !(evidencia as any).bytes) {
      return null;
    }

    const mime =
      (evidencia as any).mimeType || 'application/octet-stream';
    const nombreBase =
      (evidencia as any).nombreArchivo || `cita-${citaId}`;

    return {
      buffer: (evidencia as any).bytes as Buffer,
      mime,
      nombre: nombreBase,
    };
  }
}
