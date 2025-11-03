// PRINCIPIOS
// - SRP: DTOs definen contrato/validación de entrada.
// - KISS: sin dependencias extra; todo opcional en el update.

import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CrearServicioDto {
  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @MinLength(5)
  descripcion!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @Min(0)
  precioSugerido?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracionMinutos?: number;
}

export class ActualizarServicioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : Number(value)))
  @Min(0)
  precioSugerido?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracionMinutos?: number;
}

export class CambiarEstadoDto {
  @IsBoolean()
  activo!: boolean;
}

export class HabilitarMecanicoDto {
  @IsInt()
  @Min(1)
  mecanicoId!: number;

  @IsOptional()
  @IsBoolean()
  habilitado?: boolean; // default true en el service
}
