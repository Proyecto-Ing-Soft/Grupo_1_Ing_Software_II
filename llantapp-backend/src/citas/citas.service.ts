// src/citas/citas.service.ts

// PRINCIPIOS/PATRONES:
// - SRP: este servicio concentra reglas del caso de uso (crear, asignar, terminar y listados).
// - KISS: validaciones claras y mensajes concretos; helpers pequeños (toYMD).
// - OCP: si agregas nuevos estados o validaciones, lo haces aquí sin tocar controller/UI.
// - Ley de Demeter: no conoce detalles de transporte (HTTP) ni de la UI.
// - DRY: reutilizamos formato de fecha y select mínimos para listados.
// - Observer-like: cambios relevantes disparan notificaciones vía la fachada Notificador.
// - Facade: Notificador oculta cómo se persisten/emiten las notificaciones.

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { EstadoCita } from '@prisma/client';
import { Notificador } from '../notificaciones/envio/notificador';

@Injectable()
export class CitasService {
  constructor(
    private prisma: PrismaService,
    private noti: Notificador, // DIP: fachada de notificaciones
  ) {}

  // DRY: YYYY-MM-DD (solo fecha)
  private toYMD(d: Date) { return d.toISOString().slice(0, 10); }

  // === CREAR CITA (estado inicial: SOLICITADA) ===
  async crear(dto: CrearCitaDto, clienteId: number) {
    // KISS: validaciones mínimas de entrada
    if (!dto.programadaPara) throw new BadRequestException('Falta fecha');
    if (!dto.placaPreliminar || !dto.marcaPreliminar || !dto.modeloPreliminar)
      throw new BadRequestException('Faltan datos del vehículo');

    // No exigimos vehículo existente: se registrará el día de la cita si el mecánico valida
    const cita = await this.prisma.citaMantenimiento.create({
      data: {
        tipo: dto.tipo,
        comentario: dto.comentario ?? '',
        programadaPara: new Date(dto.programadaPara + 'T00:00:00Z'),
        estado: EstadoCita.SOLICITADA,
        clienteId,
        vehiculoId: null, // aún no existe

        // Snapshot preliminar
        placaPreliminar: dto.placaPreliminar.trim().toUpperCase(),
        marcaPreliminar: dto.marcaPreliminar.trim(),
        modeloPreliminar: dto.modeloPreliminar.trim(),
        anioPreliminar: dto.anioPreliminar ?? null,
        colorPreliminar: dto.colorPreliminar ?? null,
        vinPreliminar: dto.vinPreliminar ?? null,
      },
    });

    // Notificación a administradores (flujo de trabajo)
    const admins = await this.prisma.usuario.findMany({ where: { rol: 'ADMIN' } });
    await Promise.all(
      admins.map(a =>
        this.noti.enviar({
          usuarioId: a.id,
          citaId: cita.id,
          vehiculoId: null,
          titulo: 'Nueva cita pendiente',
          mensaje: `Cita #${cita.id} solicitada por cliente #${clienteId}`,
        }),
      ),
    );

    // 🟠 Notificación al cliente: textos actualizados
    await this.noti.enviar({
      usuarioId: clienteId,
      citaId: cita.id,
      vehiculoId: null,
      titulo: 'Solicitud registrada',
      mensaje: 'Recibimos tu solicitud de mantenimiento. Un administrador la revisará y asignará un mecánico pronto.',
    });

    return cita;
  }

  // === ASIGNAR MECÁNICO (pasa a EN_PROGRESO) ===
  async asignarMecanico(citaId: number, mecanicoId: number, _adminId: number) {
    const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id: citaId } });
    if (!cita) throw new BadRequestException('Cita no existe');
    if (cita.estado === EstadoCita.TERMINADA) throw new BadRequestException('Cita ya terminada');

    const actualizada = await this.prisma.citaMantenimiento.update({
      where: { id: citaId },
      data: { mecanicoId, estado: EstadoCita.EN_PROGRESO },
    });

    // 🟡 Notificación al cliente: textos actualizados con fecha formateada
    const fecha = actualizada.programadaPara
      ? new Date(actualizada.programadaPara).toLocaleDateString('es-PE')
      : 'fecha programada';
    await this.noti.enviar({
      usuarioId: actualizada.clienteId,
      citaId: actualizada.id,
      vehiculoId: actualizada.vehiculoId ?? null,
      titulo: 'Mantenimiento en proceso',
      mensaje: `Se asignó un mecánico a tu cita #${actualizada.id} para el ${fecha}. Tu mantenimiento está en curso según lo programado.`,
    });

    // Notificación al mecánico (flujo): mantiene el aviso operativo
    await this.noti.enviar({
      usuarioId: mecanicoId,
      citaId: actualizada.id,
      vehiculoId: actualizada.vehiculoId ?? null,
      titulo: 'Mantenimiento asignado',
      mensaje: `Se te asignó la cita #${actualizada.id}`,
    });

    return actualizada;
  }

  // === TERMINAR (solo el día programado) ===
  async terminar(citaId: number, mecanicoId: number) {
    const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id: citaId } });
    if (!cita) throw new BadRequestException('Cita no existe');
    if (cita.mecanicoId !== mecanicoId) throw new ForbiddenException('No eres el mecánico asignado');
    if (cita.estado !== EstadoCita.EN_PROGRESO) throw new BadRequestException('La cita no está en proceso');
    if (!cita.programadaPara) throw new BadRequestException('La cita no tiene fecha programada');

    // Regla de negocio: solo se puede terminar el día programado
    const hoy = this.toYMD(new Date());
    const programada = this.toYMD(new Date(cita.programadaPara));
    if (hoy !== programada) throw new BadRequestException('Solo se puede terminar el día programado');

    // Si aún no existe el vehículo, créalo con la validación del mecánico
    let vehiculoId = cita.vehiculoId ?? null;
    if (!vehiculoId) {
      const cliente = await this.prisma.usuario.findUnique({
        where: { id: cita.clienteId },
        select: { id: true, empresaId: true },
      });

      const vehiculo = await this.prisma.vehiculo.create({
        data: {
          placa: cita.placaPreliminar,
          marca: cita.marcaPreliminar,
          modelo: cita.modeloPreliminar,
          anio: cita.anioPreliminar ?? new Date().getFullYear(),
          color: cita.colorPreliminar ?? 'SIN-REGISTRO',
          vin: cita.vinPreliminar ?? null,

          propietarioUsuarioId: cita.clienteId,
          creadoPorId: mecanicoId, // auditoría: lo registró el mecánico al validar
          empresaId: cliente?.empresaId ?? null,
        },
      });
      vehiculoId = vehiculo.id;

      await this.prisma.citaMantenimiento.update({
        where: { id: citaId },
        data: { vehiculoId },
      });
    }

    const terminada = await this.prisma.citaMantenimiento.update({
      where: { id: citaId },
      data: { estado: EstadoCita.TERMINADA },
    });

    // 🟢 Notificación al cliente: textos actualizados con placa real
    const veh = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId! },
      select: { placa: true },
    });

    await this.noti.enviar({
      usuarioId: terminada.clienteId,
      citaId: terminada.id,
      vehiculoId: vehiculoId!,
      titulo: 'Mantenimiento completado',
      mensaje: `El mantenimiento del vehículo con placa ${veh?.placa ?? '—'} ha finalizado. Puedes recogerlo cuando gustes. ¡Gracias por confiar en nosotros!`,
    });

    return terminada;
  }

  // === LISTADOS PARA UI ===

  // CHOFER/EMPRESA: sus citas (mostrar placa real si existe o preliminar)
  async listarDelCliente(clienteId: number) {
    return this.prisma.citaMantenimiento.findMany({
      where: { clienteId },
      select: {
        id: true, tipo: true, estado: true, comentario: true, programadaPara: true,
        vehiculo: { select: { placa: true } },
        placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  // MECÁNICO: sus citas asignadas
  async listarDelMecanico(mecanicoId: number) {
    return this.prisma.citaMantenimiento.findMany({
      where: { mecanicoId },
      select: {
        id: true, tipo: true, estado: true, comentario: true, programadaPara: true,
        vehiculo: { select: { placa: true } },
        cliente: { select: { nombreCompleto: true } },
        placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
      },
      orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'desc' }],
    });
  }

  // ADMIN: citas pendientes por asignar
  async listarPendientes() {
    return this.prisma.citaMantenimiento.findMany({
      where: { estado: EstadoCita.SOLICITADA },
      select: {
        id: true,
        tipo: true,
        estado: true,
        comentario: true,
        programadaPara: true,
        vehiculo: { select: { placa: true } }, // si ya existiera (raro antes de terminar)
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        cliente: { select: { id: true, nombreCompleto: true } },
      },
      orderBy: [{ creadoEn: 'desc' }],
    });
  }
}
