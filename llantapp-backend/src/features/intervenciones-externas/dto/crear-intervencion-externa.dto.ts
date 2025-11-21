// SRP: DTO específico para registrar una intervención externa.
// KISS: campos mínimos y claros para el formulario del cliente.

import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearIntervencionExternaDto {
  @IsInt()
  vehiculoId!: number;

  @IsDateString()
  fecha!: string; // ISO (YYYY-MM-DD o fecha completa)

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  descripcion!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tallerNombre?: string;

  @IsOptional()
  costoAproximado?: number; // se mapea a Decimal en Prisma
}
