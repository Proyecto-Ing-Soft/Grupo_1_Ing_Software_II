// SRP/KISS: DTO estricto para creación de vehículo con IDs referenciando catálogos de BD.
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CrearVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  placa!: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  vin?: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  anio!: number;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  alias?: string;

  // Relación con catálogos globales (app.marca_vehiculo / app.modelo_vehiculo).
  @IsInt()
  marcaVehiculoId!: number;

  @IsInt()
  modeloVehiculoId!: number;

  // Usuario propietario dentro del esquema del taller.
  @IsInt()
  propietarioUsuarioId!: number;
}
