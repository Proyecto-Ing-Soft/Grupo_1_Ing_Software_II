// DTO mínimo y estricto por IDs (marca/modelo).

import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CrearVehiculoDto {
  @IsString() @IsNotEmpty() @Length(5, 10)
  placa!: string; // Formato libre validado por longitud (ajústalo si tienes regex de tu país)

  @IsOptional() @IsString() @Length(8, 30)
  vin?: string;

  @IsInt() @Min(1950) @Max(new Date().getFullYear() + 1)
  anio!: number;

  @IsOptional() @IsString() @Length(0, 30)
  color?: string;

  @IsOptional() @IsString() @Length(0, 30)
  alias?: string;

  // IDs estrictos:
  @IsInt()
  marcaVehiculoId!: number;

  @IsInt()
  modeloVehiculoId!: number;

  // Titular del vehículo (propietario inicial)
  @IsInt()
  propietarioUsuarioId!: number;
}
