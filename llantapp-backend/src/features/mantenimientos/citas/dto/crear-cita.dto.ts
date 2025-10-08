// src/citas/dto/crear-cita.dto.ts

// PRINCIPIOS:
// - SRP: el DTO solo define contrato/validación de entrada. Nada de lógica.
// - KISS: tipos simples; validaciones declarativas con class-validator.
// - OCP: si agregas campos, no tienes que cambiar a los consumidores (controller/service siguen igual).
// src/citas/dto/crear-cita.dto.ts
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoMantenimiento } from '@prisma/client';

export class CrearCitaDto {
  @IsEnum(TipoMantenimiento)
  tipo!: TipoMantenimiento; // TS: definite assignment

  // 🆕 Datos preliminares del vehículo
  @IsString() placaPreliminar!: string;
  @IsString() marcaPreliminar!: string;
  @IsString() modeloPreliminar!: string;

  @IsOptional() @IsInt()
  anioPreliminar?: number;

  @IsOptional() @IsString()
  colorPreliminar?: string;

  @IsOptional() @IsString()
  vinPreliminar?: string;

  @IsOptional() @IsString() @MinLength(0)
  comentario?: string;

  @IsDateString()
  programadaPara!: string;
}
