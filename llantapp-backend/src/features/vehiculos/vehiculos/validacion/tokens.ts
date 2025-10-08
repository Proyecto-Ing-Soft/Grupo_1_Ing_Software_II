// src/vehiculos/validadores/tokens.ts  (ajusta la ruta real)
import { Inject } from '@nestjs/common';

export const VEHICULO_VALIDADORES = 'VEHICULO_VALIDADORES';

export const InjectValidadoresVehiculo = () => Inject(VEHICULO_VALIDADORES);
