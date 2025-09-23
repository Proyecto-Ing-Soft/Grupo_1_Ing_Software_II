import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { ValidadorPlacaUnica } from './validador-placa-unica';

export interface IValidadorVehiculo {
  encadenar(arg0: ValidadorPlacaUnica): unknown;
  validar(dto: CrearVehiculoDto): Promise<void> | void;
}
