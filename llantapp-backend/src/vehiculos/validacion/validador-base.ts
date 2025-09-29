import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { IValidadorVehiculo } from './ivalidador-vehiculo';

export abstract class ValidadorBase implements IValidadorVehiculo {
  abstract validar(dto: CrearVehiculoDto): Promise<string | string[] | null>;

  protected isEmpty(s?: string | null) {
    return !s || !s.trim();
  }
}
