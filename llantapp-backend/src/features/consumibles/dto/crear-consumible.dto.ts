// SRP: DTO solo para creación de consumibles.
// KISS: campos mínimos para el formulario del admin.

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearConsumibleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  unidad!: string; // ej: "lt", "und", "kg"

  @IsInt()
  @Min(0)
  stockActual!: number;

  @IsInt()
  @Min(0)
  stockMinimo!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
