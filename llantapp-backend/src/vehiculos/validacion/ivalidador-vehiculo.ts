import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

export interface IValidadorVehiculo {
  validar(dto: CrearVehiculoDto): Promise<string | string[] | null>;
}
