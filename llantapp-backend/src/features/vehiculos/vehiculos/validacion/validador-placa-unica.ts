import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../prisma/prisma.service';

// ValidadorPlacaUnica.ts
// - SRP: valida SOLO contra la BD si la placa existe.
// - DIP: usa PrismaService inyectado; el servicio de vehículos no sabe cómo lo hace.
// - Alterno 3a: emite "La placa ya está registrada".

@Injectable()
export class ValidadorPlacaUnica extends ValidadorBase {
  constructor(private prisma: PrismaService) { super(); }

  async validar(dto: CrearVehiculoDto) {
    const placa = dto.placa?.trim().toUpperCase();
    if (!placa) return 'Placa inválida';
    const existe = await this.prisma.vehiculo.findUnique({ where: { placa } });
    if (existe) return 'La placa ya está registrada';
    return null;
  }
}
