// PRINCIPIOS
// - SRP: define contrato/validación de entrada (sin lógica).
// - KISS: tipos simples, validaciones declarativas.
// - OCP: permite ampliar campos sin afectar controller/service.

import { IsDateString, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CrearCitaDto {
  // Vehículo ya existente del cliente
  @IsInt()
  @Min(1)
  vehiculoId!: number;

  // Servicio requerido
  @IsInt()
  @Min(1)
  servicioId!: number;

  // Fecha programada (AAAA-MM-DD o ISO)
  @IsDateString()
  fechaProgramada!: string;

  // Comentarios opcionales del cliente
  @IsOptional()
  @IsString()
  @MinLength(0)
  comentariosCliente?: string;

  // Prioridad opcional (por ejemplo: 'BAJA', 'MEDIA', 'ALTA')
  @IsOptional()
  @IsString()
  prioridad?: string;
}
