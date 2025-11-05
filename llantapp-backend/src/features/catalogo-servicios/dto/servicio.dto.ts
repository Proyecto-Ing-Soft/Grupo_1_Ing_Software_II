// PRINCIPIOS
// - SRP: DTOs definen contrato/validación de entrada.
// - KISS: nombres alineados 1:1 con migración.

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toNum = ({ value }: { value: any }) =>
  value === undefined || value === null || value === '' ? undefined : Number(value);

export class CrearServicioDto {
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,32}$/) // único, estable para integraciones
  @Transform(({ value }) => String(value ?? '').trim().toUpperCase())
  codigo!: string;

  @IsString()
  @MinLength(2)
  nombre!: string;

  @IsString()
  @MinLength(5)
  descripcion!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Transform(toNum)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioBase!: number; // NOT NULL en DB

  @IsInt()
  @Min(1)
  duracionEstimadaMin!: number; // NOT NULL en DB
}

export class ActualizarServicioDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,32}$/)
  @Transform(({ value }) =>
    value === undefined ? undefined : String(value).trim().toUpperCase(),
  )
  codigo?: string;

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
  @Transform(toNum)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioBase?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duracionEstimadaMin?: number;
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
  habilitado?: boolean; // true => inserta (habilita), false => elimina (deshabilita)
}
