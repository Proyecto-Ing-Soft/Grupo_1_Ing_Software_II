import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

// SRP: verifica campos mínimos requeridos y rango razonable de año.
@Injectable()
export class ValidadorCamposObligatorios extends ValidadorBase {
  async validar(
    _slugTaller: string,
    dto: CrearVehiculoDto,
    _creadorUsuarioId: number,
  ) {
    const faltan: string[] = [];

    if (this.isEmpty(dto.placa)) faltan.push('placa');
    if (!dto.marcaVehiculoId) faltan.push('marcaVehiculoId');
    if (!dto.modeloVehiculoId) faltan.push('modeloVehiculoId');
    if (
      dto.anio === undefined ||
      dto.anio === null
    ) {
      faltan.push('anio');
    }
    if (!dto.propietarioUsuarioId) faltan.push('propietarioUsuarioId');

    if (faltan.length) {
      return `Faltan campos: ${faltan.join(', ')}`;
    }

    const currentYear = new Date().getFullYear();
    if (dto.anio < 1950 || dto.anio > currentYear + 1) {
      return 'Año fuera de rango';
    }

    return null;
  }
}
