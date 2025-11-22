// src/features/historial/historial/historial.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { Rol } from '../../../common/enums/rol.enum';

type Solicitante = { id: number; rol: Rol };

@Injectable()
export class HistorialService {
  constructor(private prisma: PrismaService) {}

  async historialPorVehiculo(vehiculoId: number, solicitante: Solicitante) {
    // 1) Traer vehículo y verificar permisos
    const v = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: {
        id: true,
        placa: true,
        marca: true,
        modelo: true,
        anio: true,
        color: true,
        propietarioUsuarioId: true,
      },
    });
    if (!v)
      throw new NotFoundException({ message: 'Vehículo no encontrado' });

    const esPropietario = v.propietarioUsuarioId === solicitante.id;
    const esTaller =
      solicitante.rol === Rol.ADMIN || solicitante.rol === Rol.MECANICO;
    if (!esPropietario && !esTaller) {
      throw new ForbiddenException({
        message: 'No puedes ver el historial de este vehículo',
      });
    }

    // 2) Fallback por placa: citas con vehiculoId = v.id
    //    O citas preliminares con vehiculoId = null y placaPreliminar = v.placa
    const baseWhereVehiculo = { vehiculoId: v.id };
    const baseWherePlaca = {
      vehiculoId: null as any,
      placaPreliminar: v.placa,
    };

    const [trabajosRealizados, proximosServicios] = await Promise.all([
      this.prisma.citaMantenimiento.findMany({
        where: {
          OR: [
            { ...baseWhereVehiculo, estado: 'TERMINADA' },
            { ...baseWherePlaca, estado: 'TERMINADA' },
          ],
        },
        orderBy: [
          { fechaMantenimiento: 'desc' },
          { programadaPara: 'desc' },
          { creadoEn: 'desc' },
        ],
        select: {
          id: true,
          fechaMantenimiento: true,
          programadaPara: true,
          trabajosRealizados: true,
          evidenciaMime: true,
          evidenciaNombre: true,
          mecanico: { select: { nombreCompleto: true } },
          servicio: { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.citaMantenimiento.findMany({
        where: {
          OR: [
            {
              ...baseWhereVehiculo,
              estado: { in: ['SOLICITADA', 'EN_PROGRESO'] },
            },
            {
              ...baseWherePlaca,
              estado: { in: ['SOLICITADA', 'EN_PROGRESO'] },
            },
          ],
        },
        orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'asc' }],
        select: {
          id: true,
          estado: true,
          programadaPara: true,
          comentario: true,
          mecanico: { select: { nombreCompleto: true } },
          servicio: { select: { id: true, nombre: true } },
        },
      }),
    ]);

    // 3) Respuesta en el shape que espera tu UI
    return {
      vehiculo: {
        id: v.id,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        color: v.color,
      },
      trabajosRealizados: trabajosRealizados.map((t) => ({
        id: t.id,
        // compat: antes era el enum TipoMantenimiento, ahora usamos el nombre del servicio
        tipo: t.servicio?.nombre ?? '—',
        servicio: t.servicio ?? null,
        fechaMantenimiento: t.fechaMantenimiento ?? t.programadaPara ?? null,
        trabajosRealizados: t.trabajosRealizados ?? null,
        mecanico: t.mecanico ?? { nombreCompleto: '—' },
        evidenciaDisponible: Boolean(t.evidenciaMime || t.evidenciaNombre),
      })),
      proximosServicios: proximosServicios.map((s) => ({
        id: s.id,
        tipo: s.servicio?.nombre ?? '—',
        servicio: s.servicio ?? null,
        estado: s.estado,
        programadaPara: s.programadaPara ?? null,
        comentario: s.comentario ?? '',
        mecanico: s.mecanico ?? null,
      })),
    };
  }
}
