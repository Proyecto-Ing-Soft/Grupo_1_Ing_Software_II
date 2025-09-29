import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../prisma/prisma.service';

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
