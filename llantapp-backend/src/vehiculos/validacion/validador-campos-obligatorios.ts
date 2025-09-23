import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { BadRequestException } from '@nestjs/common';

/** Redundante con DTO, pero ejemplifica Decorator si el negocio lo exigiera */
export class ValidadorCamposObligatorios extends ValidadorBase {
  async validar(dto: CrearVehiculoDto) {
    const obligatorios = ['placa','marca','modelo','anio','color'];
    for (const k of obligatorios) {
      if (!(dto as any)[k]) throw new BadRequestException(`El campo ${k} es obligatorio`);
    }
    await super.validar(dto);
  }
}
