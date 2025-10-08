import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

// - SRP: verifica faltantes + rango razonable de "anio".
// - Alterno 3b: devuelve campos faltantes en un solo mensaje (DRY).

@Injectable()
export class ValidadorCamposObligatorios extends ValidadorBase {
  async validar(dto: CrearVehiculoDto) {
    const faltan: string[] = [];
    if (this.isEmpty(dto.placa)) faltan.push('placa');
    if (this.isEmpty(dto.marca)) faltan.push('marca');
    if (this.isEmpty(dto.modelo)) faltan.push('modelo');
    if (dto.anio === undefined || dto.anio === null) faltan.push('anio');
    if (this.isEmpty(dto.color)) faltan.push('color');

    if (faltan.length) return `Faltan campos: ${faltan.join(', ')}`;
    if (dto.anio < 1950 || dto.anio > new Date().getFullYear() + 1) {
      return 'Año fuera de rango';
    }
    return null;
  }
}
