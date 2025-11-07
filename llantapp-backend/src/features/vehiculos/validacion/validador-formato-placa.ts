import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

// SRP: valida solo el formato básico de la placa.
const RE_PLACA = /^[A-Z0-9-]{5,10}$/;

@Injectable()
export class ValidadorFormatoPlaca extends ValidadorBase {
  async validar(
    _slugTaller: string,
    dto: CrearVehiculoDto,
    _creadorUsuarioId: number,
  ) {
    if (!dto.placa) return 'Placa inválida';

    const placa = dto.placa.trim().toUpperCase();
    if (!RE_PLACA.test(placa)) {
      return 'Formato de placa inválido';
    }

    return null;
  }
}
