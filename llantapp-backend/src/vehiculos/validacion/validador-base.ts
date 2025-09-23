import { IValidadorVehiculo } from './ivalidador-vehiculo';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

/**
 * Patrón Decorator (cadena): cada validador puede delegar al siguiente.
 * SRP: validar una regla concreta.
 * OCP: agregar nuevas reglas sin tocar las existentes.
 */
export abstract class ValidadorBase implements IValidadorVehiculo {
  protected siguiente?: IValidadorVehiculo;

  encadenar(v: IValidadorVehiculo): IValidadorVehiculo {
    this.siguiente = v; return v;
  }

  async validar(dto: CrearVehiculoDto) {
    if (this.siguiente) await this.siguiente.validar(dto);
  }
}
