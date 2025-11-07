// SRP: DTO dedicado a la acción de asignar mecánico.
import { IsInt } from 'class-validator';

export class AsignarMecanicoDto {
  @IsInt()
  mecanicoId!: number;
}
