// PRINCIPIOS:
// - SRP: este DTO define solo el contrato y la validación de entrada para crear citas.
// - KISS: campos planos y validaciones declarativas.
// - OCP: si se agregan datos de la cita, se extiende aquí sin romper controlador/servicio.

import { IsDateString, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearCitaDto {
  // El cliente autenticado se toma del JWT, no del body.

  @IsInt()
  vehiculoId!: number; // Vehículo existente del cliente.

  @IsInt()
  servicioId!: number; // Servicio solicitado.

  @IsOptional()
  @IsString()
  @MinLength(0)
  comentario?: string; // Comentarios del cliente sobre la cita.

  @IsDateString()
  fechaProgramada!: string; // Fecha/hora programada en ISO 8601.
}
