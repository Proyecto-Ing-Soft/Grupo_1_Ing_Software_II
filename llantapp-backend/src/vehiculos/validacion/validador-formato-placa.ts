import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { BadRequestException } from '@nestjs/common';

export class ValidadorFormatoPlaca extends ValidadorBase {
  async validar(dto: CrearVehiculoDto) {
    const ok = /^[A-Z0-9-]{5,10}$/.test(dto.placa);
    if (!ok) throw new BadRequestException('Formato de placa inválido');
    await super.validar(dto);
  }
}
