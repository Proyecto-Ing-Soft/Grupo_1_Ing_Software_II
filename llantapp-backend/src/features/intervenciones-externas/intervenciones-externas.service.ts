// PRINCIPIOS:
// - SRP: manejar solo reglas de negocio de intervenciones externas.
// - KISS: validaciones claras, sin mezclar transporte (HTTP) ni UI.
// - Ley de Demeter: solo habla con Prisma (infra) y DTOs.

import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { CrearIntervencionExternaDto } from './dto/crear-intervencion-externa.dto';

@Injectable()
export class IntervencionesExternasService {
  constructor(private readonly prisma: PrismaService) {}

  private parseFecha(fecha: string): Date {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    return d;
  }

  // Crear intervención externa (cliente)
  async crear(dto: CrearIntervencionExternaDto, clienteId: number) {
    // 1. Validar que el vehículo existe y pertenece al cliente
    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
      select: { id: true, placa: true },
    });

    if (!vehiculo) {
      throw new ForbiddenException('No puedes registrar intervenciones para este vehículo');
    }

    const fecha = this.parseFecha(dto.fecha);

    const created = await this.prisma.intervencionExterna.create({
      data: {
        vehiculoId: vehiculo.id,
        clienteId,
        fecha,
        kilometraje: dto.kilometraje ?? null,
        descripcion: dto.descripcion.trim(),
        tallerNombre: dto.tallerNombre?.trim() || null,
        // Prisma convierte number → Decimal si el campo es Decimal
        costoAproximado:
          typeof dto.costoAproximado === 'number'
            ? dto.costoAproximado
            : null,
      },
    });

    return created;
  }

  // Listar intervenciones externas por vehículo
  async listarPorVehiculo(
    vehiculoId: number,
    solicitanteId: number,
    solicitanteRol?: string,
  ) {
    // Permitir:
    // - CLIENTE dueño del vehículo
    // - ADMIN o MECANICO (para soporte interno)
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { id: true, propietarioUsuarioId: true },
    });

    if (!vehiculo) {
      throw new BadRequestException('Vehículo no existe');
    }

    const esPropietario = vehiculo.propietarioUsuarioId === solicitanteId;
    const esAdminOMecanico =
      solicitanteRol === 'ADMIN' || solicitanteRol === 'MECANICO';

    if (!esPropietario && !esAdminOMecanico) {
      throw new ForbiddenException('No tienes permiso para ver este historial');
    }

    const filas = await this.prisma.intervencionExterna.findMany({
      where: { vehiculoId: vehiculo.id },
      orderBy: { fecha: 'desc' },
    });

    return filas.map((f) => ({
      id: f.id,
      fecha: f.fecha.toISOString(),
      kilometraje: f.kilometraje,
      descripcion: f.descripcion,
      tallerNombre: f.tallerNombre,
      costoAproximado: f.costoAproximado, // Decimal → se serializa a string
      creadoEn: f.creadoEn.toISOString(),
    }));
  }
}
