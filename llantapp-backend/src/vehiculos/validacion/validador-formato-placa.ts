import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

// Formato Perú típico: ABC-123 (ajusta si usas otro)
const RE_PLACA = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

@Injectable()
export class ValidadorFormatoPlaca extends ValidadorBase {
  async validar(dto: CrearVehiculoDto) {
    if (!dto.placa) return 'Placa inválida';
    const placa = dto.placa.trim().toUpperCase();
    if (!RE_PLACA.test(placa)) {
      return 'Formato de placa inválido. Ej: ABC-123';
    }
    return null;
  }
}
