// PRINCIPIOS/PATRONES:
// - SRP: este servicio concentra reglas del caso de uso (crear, asignar, terminar y listados).
// - KISS: validaciones claras y mensajes concretos; helpers pequeños (toYMD).
// - OCP: si agregas nuevos estados o validaciones, lo haces aquí sin tocar controller/UI.
// - Ley de Demeter: no conoce detalles de transporte (HTTP) ni de la UI.
// - DRY: reutilizamos formato de fecha y select mínimos para listados.
// - Observer-like: cambios relevantes disparan notificaciones vía la fachada Notificador.
// - Facade: Notificador oculta cómo se persisten/emiten las notificaciones.

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { EstadoCita } from '@prisma/client';
import { Notificador } from '../../notificaciones/notificaciones/envio/notificador';

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
    // ✅ Validación de fecha futura/actual (sin TZ)
    if (!dto.programadaPara || !/^\d{4}-\d{2}-\d{2}$/.test(dto.programadaPara)) {
      throw new BadRequestException('Fecha inválida (usa AAAA-MM-DD)');
    }
    const hoyYMD = this.toYMD(new Date()); // e.g. "2025-10-07"
    const ymd = dto.programadaPara.slice(0, 10);
    if (ymd < hoyYMD) {
      throw new BadRequestException('La fecha programada debe ser hoy o una fecha futura');
    }

    if (!dto.placaPreliminar || !dto.marcaPreliminar || !dto.modeloPreliminar) {
      throw new BadRequestException('Faltan datos del vehículo');
    }

    // Crear cita
    const cita = await this.prisma.citaMantenimiento.create({
      data: {
        tipo: dto.tipo,
        comentario: dto.comentario ?? '',
        programadaPara: new Date(dto.programadaPara + 'T00:00:00Z'),
        estado: EstadoCita.SOLICITADA,
        clienteId,
        vehiculoId: null,
        placaPreliminar: dto.placaPreliminar.trim().toUpperCase(),
        marcaPreliminar: dto.marcaPreliminar.trim(),
        modeloPreliminar: dto.modeloPreliminar.trim(),
        anioPreliminar: dto.anioPreliminar ?? null,
        colorPreliminar: dto.colorPreliminar ?? null,
        vinPreliminar: dto.vinPreliminar ?? null,
      },
    });

    // Notificación a administradores
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

    // Notificación al cliente
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

    // Notificación al cliente
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

    // Notificación al mecánico
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
  async terminar(
    citaId: number,
    mecanicoId: number,
    dto?: { trabajosRealizados?: string; repuestos?: string[]; evidenciaBase64?: string | null }
  ) {
    const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id: citaId } });
    if (!cita) throw new BadRequestException('Cita no existe');
    if (cita.mecanicoId !== mecanicoId) throw new ForbiddenException('No eres el mecánico asignado');
    if (cita.estado !== EstadoCita.EN_PROGRESO) throw new BadRequestException('La cita no está en proceso');
    if (!cita.programadaPara) throw new BadRequestException('La cita no tiene fecha programada');

    // permite terminar el mismo día o después
    const hoy = this.toYMD(new Date());
    const programada = this.toYMD(new Date(cita.programadaPara));
    if (hoy < programada) throw new BadRequestException('Aún no es el día programado');

    // 1) Intentar enlazar vehículo existente por placa si no hay vehiculoId
    let vehiculoId = cita.vehiculoId ?? null;
    let vehiculo = null as null | { id: number; placa: string | null };

    if (!vehiculoId) {
      const placaNorm = (cita.placaPreliminar ?? '').trim().toUpperCase();
      if (placaNorm) {
        const existente = await this.prisma.vehiculo.findUnique({
          where: { placa: placaNorm },
          select: { id: true, placa: true },
        });
        if (existente) {
          vehiculoId = existente.id;
          vehiculo = existente;
          await this.prisma.citaMantenimiento.update({
            where: { id: citaId },
            data: { vehiculoId },
          });
        }
      }
    } else {
      vehiculo = await this.prisma.vehiculo.findUnique({
        where: { id: vehiculoId },
        select: { id: true, placa: true },
      });
    }

    // 2) Update con campos existentes en tu schema
    const dataUpdate: any = {
      estado: EstadoCita.TERMINADA,
      fechaMantenimiento: new Date(), // ← si existe en tu schema
    };
    if (dto?.trabajosRealizados != null) dataUpdate.trabajosRealizados = dto.trabajosRealizados;
    if (dto?.repuestos != null)         dataUpdate.repuestos          = dto.repuestos;

    // Evidencia (opcional, guardada como bytes + metadata)
    if (dto?.evidenciaBase64) {
      const m = /^data:(.+);base64,(.+)$/.exec(dto.evidenciaBase64);
      if (!m) throw new BadRequestException('Imagen inválida');
      const mime = m[1]; const b64 = m[2]; const buf = Buffer.from(b64, 'base64');
      if (buf.byteLength > 5 * 1024 * 1024) throw new BadRequestException('La imagen no debe superar 5MB');
      dataUpdate.evidenciaBytes  = buf;
      dataUpdate.evidenciaMime   = mime;
      dataUpdate.evidenciaNombre = `cita-${citaId}-${Date.now()}`;
    }

    const terminada = await this.prisma.citaMantenimiento.update({
      where: { id: citaId },
      data: dataUpdate,
    });

    // 3) Notificación final
    const placaMostrar =
      vehiculo?.placa
        ?? (cita.placaPreliminar && cita.placaPreliminar.trim()
              ? cita.placaPreliminar.trim().toUpperCase()
              : 'PLACA AÚN NO REGISTRADA');

    await this.noti.enviar({
      usuarioId: terminada.clienteId,
      citaId: terminada.id,
      vehiculoId: vehiculoId ?? null,
      titulo: 'Mantenimiento completado',
      mensaje: `El mantenimiento del vehículo con placa ${placaMostrar} ha finalizado. ¡Gracias por confiar en nosotros!`,
    });

    return terminada;
  }

  // === LISTADOS PARA UI ===

  // CLIENTE/EMPRESA: sus citas
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
        vehiculo: { select: { placa: true } }, 
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        cliente: { select: { id: true, nombreCompleto: true } },
      },
      orderBy: [{ creadoEn: 'desc' }],
    });
  }

  async buscarPorIdConVehiculo(id: number) {
    return this.prisma.citaMantenimiento.findUnique({
      where: { id },
      include: { vehiculo: true },
    });
  }
}
