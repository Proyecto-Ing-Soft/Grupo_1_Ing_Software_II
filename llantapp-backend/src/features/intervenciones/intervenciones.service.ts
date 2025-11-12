import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CrearIntervencionExternaDto } from './dto/crear-intervencion-externa.dto';

@Injectable()
export class IntervencionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearIntervencionExternaDto, clienteId: number, _slug: string) {
    const vehiculo = await this.prisma.vehiculo.findFirst({
      where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
      select: { id: true },
    });
    if (!vehiculo) throw new BadRequestException('El vehículo indicado no pertenece al cliente');

    const fecha = new Date(dto.fecha);
    if (Number.isNaN(fecha.getTime())) throw new BadRequestException('Fecha inválida');

    return this.prisma.intervencionExterna.create({
      data: {
        vehiculoId: dto.vehiculoId,
        clienteUsuarioId: clienteId,
        fecha,
        descripcion: dto.descripcion,
        comprobanteUrl: dto.comprobanteUrl ?? null,
      },
    });
  }

  async listarDelCliente(clienteId: number) {
    return this.prisma.intervencionExterna.findMany({
      where: { clienteUsuarioId: clienteId },
      orderBy: { fecha: 'desc' },
    });
  }

  async listarPorVehiculo(vehiculoId: number) {
    return this.prisma.intervencionExterna.findMany({
      where: { vehiculoId },
      orderBy: { fecha: 'desc' },
    });
  }
}
