// PRINCIPIOS/PATRONES:
// - SRP: este servicio concentra reglas del caso de uso (crear, asignar, terminar y listados).
// - KISS: validaciones claras y mensajes concretos; helpers pequeños (toYMD).
// - OCP: si agregas nuevos estados o validaciones, lo haces aquí sin tocar controller/UI.
// - Ley de Demeter: no conoce detalles de transporte (HTTP) ni de la UI.
// - DRY: reutilizamos formato de fecha y select mínimos para listados.
// - Observer-like: cambios relevantes disparan notificaciones vía la fachada Notificador.
// - Facade: Notificador oculta cómo se persisten/emiten las notificaciones.

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { Notificador } from '../notificaciones/envio/notificador';

@Injectable()
export class CitasService {
  constructor(private prisma: PrismaService, private noti: Notificador) {}

  // === Helper: obtener id de estado por código ===
  private async estadoId(codigo: string) {
    const e = await this.prisma.estadoCita.findUnique({ where: { codigo } });
    if (!e) throw new BadRequestException(`Estado '${codigo}' no existe`);
    return e.id;
  }

  // === CREAR CITA ===
  async crear(dto: CrearCitaDto, clienteUsuarioId: number) {
    if (!dto.servicioId) throw new BadRequestException('Debe indicar un servicio');
    if (!dto.fechaProgramada) throw new BadRequestException('Debe indicar la fecha programada');

    const fecha = new Date(dto.fechaProgramada);
    const hoy = new Date();
    if (fecha < new Date(hoy.toDateString())) {
      throw new BadRequestException('La fecha programada debe ser hoy o futura');
    }

    // validar vehículo del cliente
    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { id: dto.vehiculoId, propietarioUsuarioId: clienteUsuarioId },
      select: { id: true },
    });
    if (!vehiculo) throw new BadRequestException('Vehículo no válido para este cliente');

    const estadoSolicitadaId = await this.estadoId('solicitada');

    const cita = await this.prisma.cita.create({
      data: {
        clienteUsuarioId,
        vehiculoId: dto.vehiculoId,
        servicioId: dto.servicioId,
        fechaProgramada: fecha,
        estadoCitaId: estadoSolicitadaId,
        prioridad: dto.prioridad ?? null,
        comentariosCliente: dto.comentariosCliente ?? '',
      },
    });

    // Insertar historial
    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId: cita.id,
        estadoCitaId: estadoSolicitadaId,
        cambiadoPorUsuarioId: clienteUsuarioId,
        observacion: 'Cita solicitada por el cliente',
      },
    });

    // Notificar administradores
    const admins = await this.prisma.usuarioRol.findMany({
      where: { rol: { codigo: 'ADMIN_TALLER' } },
      select: { usuarioId: true },
    });
    await Promise.all(
      admins.map(({ usuarioId }: { usuarioId: number }) =>
        this.noti.enviar({
          usuarioId,
          citaId: cita.id,
          vehiculoId: cita.vehiculoId,
          titulo: 'Nueva cita solicitada',
          mensaje: `El cliente #${clienteUsuarioId} solicitó una nueva cita #${cita.id}`,
        }),
      ),
    );

    // Notificar cliente
    await this.noti.enviar({
      usuarioId: clienteUsuarioId,
      citaId: cita.id,
      vehiculoId: cita.vehiculoId,
      titulo: 'Solicitud registrada',
      mensaje:
        'Tu cita fue registrada correctamente. Un administrador la revisará y asignará un mecánico pronto.',
    });

    return cita;
  }

  // === ASIGNAR MECÁNICO ===
  async asignarMecanico(citaId: number, mecanicoUsuarioId: number, adminId: number) {
    const cita = await this.prisma.cita.findUnique({ where: { id: citaId } });
    if (!cita) throw new NotFoundException('Cita no encontrada');

    const estadoAsignadaId = await this.estadoId('asignada');
    const estadoEnProgresoId = await this.estadoId('en_progreso');

    // Registrar asignación activa
    await this.prisma.asignacion.create({
      data: {
        citaId,
        mecanicoUsuarioId,
        asignadoPorUsuarioId: adminId,
      },
    });

    // Actualizar estado a "asignada"
    const actualizada = await this.prisma.cita.update({
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
        observacion: 'Cita asignada a mecánico',
      },
    });

    // Notificar mecánico y cliente
    await this.noti.enviar({
      usuarioId: mecanicoUsuarioId,
      citaId,
      vehiculoId: cita.vehiculoId,
      titulo: 'Nueva cita asignada',
      mensaje: `Se te asignó la cita #${citaId}`,
    });

    await this.noti.enviar({
      usuarioId: cita.clienteUsuarioId,
      citaId,
      vehiculoId: cita.vehiculoId,
      titulo: 'Tu cita fue asignada',
      mensaje: `Se asignó un mecánico a tu cita #${citaId}.`,
    });

    // Actualizar a "en_progreso" si aplica
    await this.prisma.cita.update({
      where: { id: citaId },
      data: { estadoCitaId: estadoEnProgresoId },
    });

    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId,
        estadoCitaId: estadoEnProgresoId,
        cambiadoPorUsuarioId: mecanicoUsuarioId,
        observacion: 'Mecánico inició el mantenimiento',
      },
    });

    return actualizada;
  }

  // === TERMINAR CITA ===
  async terminar(citaId: number, mecanicoUsuarioId: number) {
    const cita = await this.prisma.cita.findUnique({
      where: { id: citaId },
      select: { id: true, clienteUsuarioId: true, vehiculoId: true, estadoCitaId: true },
    });
    if (!cita) throw new NotFoundException('Cita no encontrada');

    const estadoEnProgreso = await this.prisma.estadoCita.findUnique({
      where: { codigo: 'en_progreso' },
    });
    const estadoTerminada = await this.prisma.estadoCita.findUnique({
      where: { codigo: 'terminada' },
    });

    if (cita.estadoCitaId !== estadoEnProgreso?.id)
      throw new BadRequestException('La cita no está en progreso');

    const actualizada = await this.prisma.cita.update({
      where: { id: citaId },
      data: {
        estadoCitaId: estadoTerminada?.id,
        ultimaActualizacion: new Date(),
      },
    });

    await this.prisma.citaHistorialEstado.create({
      data: {
        citaId,
        estadoCitaId: estadoTerminada?.id!,
        cambiadoPorUsuarioId: mecanicoUsuarioId,
        observacion: 'Mantenimiento finalizado',
      },
    });

    await this.noti.enviar({
      usuarioId: cita.clienteUsuarioId,
      citaId,
      vehiculoId: cita.vehiculoId,
      titulo: 'Mantenimiento completado',
      mensaje: `Tu cita #${citaId} fue marcada como terminada. Gracias por confiar en nosotros.`,
    });

    return actualizada;
  }

  // === LISTADOS ===

  async listarDelCliente(clienteUsuarioId: number) {
    return this.prisma.cita.findMany({
      where: { clienteUsuarioId },
      select: {
        id: true,
        fechaProgramada: true,
        comentariosCliente: true,
        prioridad: true,
        estadoCita: { select: { codigo: true, nombre: true } },
        vehiculo: { select: { placa: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async listarDelMecanico(mecanicoUsuarioId: number) {
    return this.prisma.asignacion.findMany({
      where: { mecanicoUsuarioId, activo: true },
      select: {
        cita: {
          select: {
            id: true,
            fechaProgramada: true,
            comentariosCliente: true,
            prioridad: true,
            estadoCita: { select: { codigo: true, nombre: true } },
            vehiculo: { select: { placa: true } },
            servicio: { select: { nombre: true } },
          },
        },
      },
      orderBy: { fechaAsignacion: 'asc' },
    });
  }

  async listarPendientes() {
    const estadoSolicitadaId = await this.estadoId('solicitada');
    return this.prisma.cita.findMany({
      where: { estadoCitaId: estadoSolicitadaId },
      select: {
        id: true,
        fechaProgramada: true,
        comentariosCliente: true,
        prioridad: true,
        clienteUsuario: { select: { id: true, nombres: true, apellidos: true } },
        vehiculo: { select: { placa: true } },
        servicio: { select: { nombre: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });
  }

  async buscarPorIdConVehiculo(id: number) {
    return this.prisma.cita.findUnique({
      where: { id },
      include: {
        vehiculo: { select: { id: true, placa: true, alias: true } },
        servicio: { select: { id: true, nombre: true } },
        estadoCita: { select: { codigo: true, nombre: true } },
        clienteUsuario: { select: { id: true, nombres: true, apellidos: true } },
      },
    });
  }
}
