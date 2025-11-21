// SRP: DTO dedicado a una acción de negocio puntual (asignar).
// KISS: un solo campo, intención clarita.

import { IsInt } from 'class-validator';

export class AsignarMecanicoDto {
  @IsInt()
  mecanicoId!: number;
}
