import { Inject } from '@nestjs/common';

export const VEHICULO_VALIDADORES = 'VEHICULO_VALIDADORES';

export const InjectValidadoresVehiculo = () => Inject(VEHICULO_VALIDADORES);
