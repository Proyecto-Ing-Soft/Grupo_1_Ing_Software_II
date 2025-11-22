// PRINCIPIOS:
// - SRP: el DTO solo define contrato/validación de entrada. Nada de lógica.
// - KISS: tipos simples; validaciones declarativas con class-validator.
// - OCP: si agregas campos, no tienes que cambiar a los consumidores (controller/service siguen igual).

import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class ConsumoDto {
  @IsInt()
  @Min(1)
  consumibleId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}

export class CrearCitaDto {
  // 🔹 AHORA usamos el servicio como "tipo" de mantenimiento
  @IsInt()
  @Min(1)
  servicioId!: number;

  // si el cliente ya tiene vehículo registrado
  @IsOptional()
  @IsInt()
  vehiculoId?: number;

  // Datos preliminares (solo si no manda vehiculoId)
  @IsOptional()
  @IsString()
  placaPreliminar?: string;

  @IsOptional()
  @IsString()
  marcaPreliminar?: string;

  @IsOptional()
  @IsString()
  modeloPreliminar?: string;

  @IsOptional()
  @IsInt()
  anioPreliminar?: number;

  @IsOptional()
  @IsString()
  colorPreliminar?: string;

  @IsOptional()
  @IsString()
  vinPreliminar?: string;

  @IsOptional()
  @IsString()
  @MinLength(0)
  comentario?: string;

  @IsDateString()
  programadaPara!: string;
}
