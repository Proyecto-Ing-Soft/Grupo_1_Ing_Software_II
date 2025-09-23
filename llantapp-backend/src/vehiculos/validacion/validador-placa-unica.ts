import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

export class ValidadorPlacaUnica extends ValidadorBase {
  constructor(private readonly prisma: PrismaService) { super(); }

  async validar(dto: CrearVehiculoDto) {
    const existe = await this.prisma.vehiculo.findUnique({ where: { placa: dto.placa } });
    if (existe) throw new ConflictException('La placa ya está registrada');
    await super.validar(dto);
  }
}
