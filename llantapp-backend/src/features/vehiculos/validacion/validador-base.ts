import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { IValidadorVehiculo } from './ivalidador-vehiculo';

// SRP: base común para validadores de vehículo.
export abstract class ValidadorBase implements IValidadorVehiculo {
  abstract validar(
    slugTaller: string,
    dto: CrearVehiculoDto,
    creadorUsuarioId: number,
  ): Promise<string | string[] | null>;

  protected isEmpty(s?: string | null) {
    return !s || !s.trim();
  }
}
