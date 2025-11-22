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
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { EstadoCita } from '@prisma/client';
import { Notificador } from '../../notificaciones/notificaciones/envio/notificador';
import { ConsumiblesService } from '../../consumibles/consumibles.service';

@Injectable()
export class CitasService {
  constructor(
    private prisma: PrismaService,
    private noti: Notificador, // DIP: fachada de notificaciones
    private consumiblesService: ConsumiblesService, // US-20: lógica de consumo de stock
  ) {}

  // DRY: YYYY-MM-DD en HORA LOCAL (sin UTC)
  private toYMD(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Helper: parsear "YYYY-MM-DD" como Date LOCAL (medianoche local)
  private parseYMDLocal(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // === CREAR CITA (estado inicial: SOLICITADA) ===
  async crear(dto: CrearCitaDto, clienteId: number) {
    // Validación de fecha (AAAA-MM-DD) y que no sea pasada
    if (
      !dto.programadaPara ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dto.programadaPara)
    ) {
      throw new BadRequestException('Fecha inválida (usa AAAA-MM-DD)');
    }
    const hoyYMD = this.toYMD(new Date()); // ← hoy local
    const ymd = dto.programadaPara.slice(0, 10); // normalizamos a YYYY-MM-DD
    if (ymd < hoyYMD) {
      throw new BadRequestException(
        'La fecha programada debe ser hoy o una fecha futura',
      );
    }

    // Validar que el servicio exista y esté activo
    const servicio = await this.prisma.servicio.findUnique({
      where: { id: dto.servicioId },
      select: { id: true, nombre: true, activo: true },
    });
    if (!servicio || !servicio.activo) {
      throw new BadRequestException('Servicio no válido');
    }

    // Si viene vehiculoId: validar pertenencia y tomar snapshot del vehículo.
    // Si NO viene vehiculoId: exigir placa/marca/modelo preliminares.
    let vehiculoId: number | undefined = undefined;

    type Snapshot = {
      placaPreliminar?: string;
      marcaPreliminar?: string;
      modeloPreliminar?: string;
      anioPreliminar?: number;
      colorPreliminar?: string;
      vinPreliminar?: string;
    };
    let snapshot: Snapshot = {};

    if (dto.vehiculoId) {
      const vehiculo = await this.prisma.vehiculo.findFirst({
        where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
        select: {
          id: true,
          placa: true,
          marca: true,
          modelo: true,
          anio: true,
          color: true,
          vin: true,
        },
      });
      if (!vehiculo) {
        throw new BadRequestException('Vehículo no válido para este usuario');
      }

      vehiculoId = vehiculo.id;
      snapshot = {
        ...(vehiculo.placa
          ? { placaPreliminar: vehiculo.placa.toUpperCase() }
          : {}),
        ...(vehiculo.marca ? { marcaPreliminar: vehiculo.marca } : {}),
        ...(vehiculo.modelo ? { modeloPreliminar: vehiculo.modelo } : {}),
        ...(vehiculo.anio != null ? { anioPreliminar: vehiculo.anio } : {}),
        ...(vehiculo.color ? { colorPreliminar: vehiculo.color } : {}),
        ...(vehiculo.vin ? { vinPreliminar: vehiculo.vin } : {}),
      };
    } else {
      if (
        !dto.placaPreliminar ||
        !dto.marcaPreliminar ||
        !dto.modeloPreliminar
      ) {
        throw new BadRequestException(
          'Selecciona un vehículo o completa placa, marca y modelo',
        );
      }
      snapshot = {
        ...(dto.placaPreliminar
          ? { placaPreliminar: dto.placaPreliminar.trim().toUpperCase() }
          : {}),
        ...(dto.marcaPreliminar
          ? { marcaPreliminar: dto.marcaPreliminar.trim() }
          : {}),
        ...(dto.modeloPreliminar
          ? { modeloPreliminar: dto.modeloPreliminar.trim() }
          : {}),
        ...(dto.anioPreliminar != null
          ? { anioPreliminar: dto.anioPreliminar }
          : {}),
        ...(dto.colorPreliminar
          ? { colorPreliminar: dto.colorPreliminar.trim() }
          : {}),
        ...(dto.vinPreliminar
          ? { vinPreliminar: dto.vinPreliminar.trim() }
          : {}),
      };
    }

    const data: any = {
      // 👇 ya NO usamos `tipo`, ahora referenciamos el catálogo de servicios
      servicioId: dto.servicioId,
      comentario: dto.comentario ?? '',
      // Guardar como Date LOCAL (no UTC-Z)
      programadaPara: this.parseYMDLocal(ymd),
      estado: EstadoCita.SOLICITADA,
      clienteId,
      ...(vehiculoId ? { vehiculoId } : {}),
      ...snapshot,
    };

    const cita = await this.prisma.citaMantenimiento.create({ data });

    // Notificación a administradores
    const admins = await this.prisma.usuario.findMany({
      where: { rol: 'ADMIN' },
    });
    await Promise.all(
      admins.map((a) =>
        this.noti.enviar({
          usuarioId: a.id,
          citaId: cita.id,
          vehiculoId: cita.vehiculoId ?? null,
          titulo: 'Nueva cita pendiente',
          mensaje: `Cita #${cita.id} solicitada por cliente #${clienteId}`,
        }),
      ),
    );

    // Notificación al cliente
    await this.noti.enviar({
      usuarioId: clienteId,
      citaId: cita.id,
      vehiculoId: cita.vehiculoId ?? null,
      titulo: 'Solicitud registrada',
      mensaje:
        'Recibimos tu solicitud de mantenimiento. Un administrador la revisará y asignará un mecánico pronto.',
    });

    return cita;
  }

  // === ASIGNAR MECÁNICO (pasa a EN_PROGRESO) ===
  async asignarMecanico(citaId: number, mecanicoId: number, _adminId: number) {
    const cita = await this.prisma.citaMantenimiento.findUnique({
      where: { id: citaId },
    });
    if (!cita) throw new BadRequestException('Cita no existe');
    if (cita.estado === EstadoCita.TERMINADA) {
      throw new BadRequestException('Cita ya terminada');
    }

    // 🔐 Validar que el usuario existe y realmente es MECÁNICO
    const mecanico = await this.prisma.usuario.findUnique({
      where: { id: mecanicoId },
      select: { id: true, rol: true, nombreCompleto: true },
    });
    if (!mecanico || mecanico.rol !== 'MECANICO') {
      throw new BadRequestException('Mecánico no válido');
    }

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
    dto?: {
      trabajosRealizados?: string;
      repuestos?: string[];
      evidenciaBase64?: string | null;

      // US-20: consumibles usados para descontar stock
      consumos?: {
        consumibleId: number;
        cantidad: number;
      }[];
    },
  ) {
    const cita = await this.prisma.citaMantenimiento.findUnique({
      where: { id: citaId },
    });
    if (!cita) throw new BadRequestException('Cita no existe');
    if (cita.mecanicoId !== mecanicoId) {
      throw new ForbiddenException('No eres el mecánico asignado');
    }
    if (cita.estado !== EstadoCita.EN_PROGRESO) {
      throw new BadRequestException('La cita no está en proceso');
    }
    if (!cita.programadaPara) {
      throw new BadRequestException('La cita no tiene fecha programada');
    }

    // permite terminar el mismo día o después (comparación por YMD local)
    const hoy = this.toYMD(new Date());
    const programada = this.toYMD(new Date(cita.programadaPara));
    if (hoy < programada) {
      throw new BadRequestException('Aún no es el día programado');
    }

    // 0) US-20: consumir stock de los consumibles usados (si se envían)
    if (dto?.consumos && dto.consumos.length > 0) {
      await this.consumiblesService.consumirEnMantenimiento(dto.consumos);
    }

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
    if (dto?.trabajosRealizados != null) {
      dataUpdate.trabajosRealizados = dto.trabajosRealizados;
    }
    if (dto?.repuestos != null) {
      dataUpdate.repuestos = dto.repuestos;
    }

    // Evidencia (opcional, guardada como bytes + metadata)
    if (dto?.evidenciaBase64) {
      const m = /^data:(.+);base64,(.+)$/.exec(dto.evidenciaBase64);
      if (!m) throw new BadRequestException('Imagen inválida');
      const mime = m[1];
      const b64 = m[2];
      const buf = Buffer.from(b64, 'base64');
      if (buf.byteLength > 5 * 1024 * 1024) {
        throw new BadRequestException('La imagen no debe superar 5MB');
      }
      dataUpdate.evidenciaBytes = buf;
      dataUpdate.evidenciaMime = mime;
      dataUpdate.evidenciaNombre = `cita-${citaId}-${Date.now()}`;
    }

    const terminada = await this.prisma.citaMantenimiento.update({
      where: { id: citaId },
      data: dataUpdate,
    });

    // 3) Notificación final
    const placaMostrar =
      vehiculo?.placa ??
      (cita.placaPreliminar && cita.placaPreliminar.trim()
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
    const citas = await this.prisma.citaMantenimiento.findMany({
      where: { clienteId },
      select: {
        id: true,
        estado: true,
        comentario: true,
        programadaPara: true,
        vehiculo: { select: { placa: true } },
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        servicio: { select: { id: true, nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return citas.map((c) => ({
      id: c.id,
      // compat con front: campo "tipo" ahora es el nombre del servicio
      tipo: c.servicio?.nombre ?? '—',
      estado: c.estado,
      comentario: c.comentario,
      programadaPara: c.programadaPara,
      vehiculo: c.vehiculo,
      placaPreliminar: c.placaPreliminar,
      marcaPreliminar: c.marcaPreliminar,
      modeloPreliminar: c.modeloPreliminar,
      servicio: c.servicio ?? null,
    }));
  }

  // MECÁNICO: sus citas asignadas
  async listarDelMecanico(mecanicoId: number) {
    const citas = await this.prisma.citaMantenimiento.findMany({
      where: { mecanicoId },
      select: {
        id: true,
        estado: true,
        comentario: true,
        programadaPara: true,
        vehiculo: { select: { placa: true } },
        cliente: { select: { nombreCompleto: true } },
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        servicio: { select: { id: true, nombre: true } },
      },
      orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'desc' }],
    });

    return citas.map((c) => ({
      id: c.id,
      tipo: c.servicio?.nombre ?? '—',
      estado: c.estado,
      comentario: c.comentario,
      programadaPara: c.programadaPara,
      vehiculo: c.vehiculo,
      cliente: c.cliente,
      placaPreliminar: c.placaPreliminar,
      marcaPreliminar: c.marcaPreliminar,
      modeloPreliminar: c.modeloPreliminar,
      servicio: c.servicio ?? null,
    }));
  }

  // ADMIN: citas pendientes por asignar o en progreso
  async listarPendientes() {
    const citas = await this.prisma.citaMantenimiento.findMany({
      // Traer todo lo que NO esté terminado (SOLICITADA y EN_PROGRESO)
      where: { estado: { not: EstadoCita.TERMINADA } },
      select: {
        id: true,
        estado: true,
        comentario: true,
        programadaPara: true,
        vehiculo: { select: { placa: true } },
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        cliente: { select: { id: true, nombreCompleto: true } },

        mecanicoId: true,
        mecanico: { select: { id: true, nombreCompleto: true } },

        servicio: { select: { id: true, nombre: true } },
      },
      orderBy: [{ creadoEn: 'desc' }],
    });

    return citas.map((c) => ({
      id: c.id,
      tipo: c.servicio?.nombre ?? '—',
      estado: c.estado,
      comentario: c.comentario,
      programadaPara: c.programadaPara,
      vehiculo: c.vehiculo,
      placaPreliminar: c.placaPreliminar,
      marcaPreliminar: c.marcaPreliminar,
      modeloPreliminar: c.modeloPreliminar,
      cliente: c.cliente,
      mecanicoId: c.mecanicoId,
      mecanico: c.mecanico ?? null,
      servicio: c.servicio ?? null,
    }));
  }

  // ADMIN: citas vencidas (fecha programada pasada y no TERMINADA)
  async listarVencidas() {
    // Normalizamos "hoy" a medianoche local para comparación limpia
    const hoyYMD = this.toYMD(new Date());
    const hoyLocal = this.parseYMDLocal(hoyYMD);

    const citas = await this.prisma.citaMantenimiento.findMany({
      where: {
        programadaPara: { lt: hoyLocal },
        estado: { not: EstadoCita.TERMINADA },
      },
      select: {
        id: true,
        estado: true,
        comentario: true,
        programadaPara: true,
        vehiculo: { select: { placa: true } },
        placaPreliminar: true,
        marcaPreliminar: true,
        modeloPreliminar: true,
        cliente: { select: { id: true, nombreCompleto: true } },
        mecanicoId: true,
        mecanico: { select: { id: true, nombreCompleto: true } },
        servicio: { select: { id: true, nombre: true } },
      },
      orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'desc' }],
    });

    return citas.map((c) => ({
      id: c.id,
      tipo: c.servicio?.nombre ?? '—',
      estado: c.estado,
      comentario: c.comentario,
      programadaPara: c.programadaPara,
      vehiculo: c.vehiculo,
      placaPreliminar: c.placaPreliminar,
      marcaPreliminar: c.marcaPreliminar,
      modeloPreliminar: c.modeloPreliminar,
      cliente: c.cliente,
      mecanicoId: c.mecanicoId,
      mecanico: c.mecanico ?? null,
      servicio: c.servicio ?? null,
    }));
  }

  async buscarPorIdConVehiculo(id: number) {
    return this.prisma.citaMantenimiento.findUnique({
      where: { id },
      include: { vehiculo: true, servicio: true },
    });
  }

  // ============================================
  // US-07: RESUMEN TÉCNICO DE UNA CITA TERMINADA
  // ============================================
  async generarResumenTecnico(
    citaId: number,
    solicitanteId: number,
    solicitanteRol?: string,
  ) {
    const cita = await this.prisma.citaMantenimiento.findUnique({
      where: { id: citaId },
      include: {
        vehiculo: true,
        cliente: { select: { id: true, nombreCompleto: true } },
        mecanico: { select: { id: true, nombreCompleto: true } },
        servicio: { select: { id: true, nombre: true } },
      },
    });

    if (!cita) {
      throw new BadRequestException('Cita no existe');
    }

    // Solo ADMIN, cliente dueño o mecánico asignado pueden ver el resumen
    const esAdmin = solicitanteRol === 'ADMIN';
    const esCliente = cita.clienteId === solicitanteId;
    const esMecanico = cita.mecanicoId === solicitanteId;

    if (!esAdmin && !esCliente && !esMecanico) {
      throw new ForbiddenException('No tienes permiso para ver esta cita');
    }

    if (cita.estado !== EstadoCita.TERMINADA) {
      throw new BadRequestException('La cita aún no está terminada');
    }

    // Info de vehículo: preferir vehiculo real, luego snapshot
    const placa =
      cita.vehiculo?.placa ??
      (cita.placaPreliminar
        ? cita.placaPreliminar.toUpperCase()
        : null);
    const marca = cita.vehiculo?.marca ?? cita.marcaPreliminar ?? null;
    const modelo = cita.vehiculo?.modelo ?? cita.modeloPreliminar ?? null;
    const anio = cita.vehiculo?.anio ?? cita.anioPreliminar ?? null;

    // Repuestos: se guardan como JSON (array de strings en nuestro flujo)
    let repuestos: string[] = [];
    if (Array.isArray(cita.repuestos)) {
      repuestos = cita.repuestos as string[];
    }

    const fechaMantenimientoISO = cita.fechaMantenimiento
      ? cita.fechaMantenimiento.toISOString()
      : null;

    const fechaMantenimientoTexto = cita.fechaMantenimiento
      ? cita.fechaMantenimiento.toLocaleString('es-PE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Sin fecha registrada';

    const tipoTexto = cita.servicio?.nombre ?? '—';

    // Texto “bonito” para compartir/copiar
    const resumenTexto = [
      `Resumen técnico – Cita #${cita.id}`,
      `Fecha de mantenimiento: ${fechaMantenimientoTexto}`,
      `Tipo de mantenimiento: ${tipoTexto}`,
      '',
      `Vehículo: ${marca ?? '-'} ${modelo ?? ''}`.trim() +
        (anio ? ` (${anio})` : ''),
      `Placa: ${placa ?? '-'}`,
      '',
      `Cliente: ${cita.cliente?.nombreCompleto ?? '-'}`,
      `Mecánico: ${cita.mecanico?.nombreCompleto ?? '-'}`,
      '',
      'Trabajos realizados:',
      cita.trabajosRealizados?.trim() || '-',
      '',
      'Repuestos utilizados:',
      repuestos.length ? `- ${repuestos.join('\n- ')}` : '-',
    ].join('\n');

    return {
      citaId: cita.id,
      // compat: devolvemos "tipo" como texto del servicio
      tipo: tipoTexto,
      estado: cita.estado,
      fechaMantenimiento: fechaMantenimientoISO,
      cliente: cita.cliente ?? null,
      mecanico: cita.mecanico ?? null,
      servicio: cita.servicio ?? null,
      vehiculo: {
        placa,
        marca,
        modelo,
        anio,
      },
      trabajosRealizados: cita.trabajosRealizados ?? '',
      repuestos,
      resumenTexto,
    };
  }
}
