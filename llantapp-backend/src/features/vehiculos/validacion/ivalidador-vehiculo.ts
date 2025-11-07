// ISP/SRP: contrato mínimo para validadores de creación de vehículo.
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';

export interface IValidadorVehiculo {
  validar(
    slugTaller: string,
    dto: CrearVehiculoDto,
    creadorUsuarioId: number,
  ): Promise<string | string[] | null>;
}
