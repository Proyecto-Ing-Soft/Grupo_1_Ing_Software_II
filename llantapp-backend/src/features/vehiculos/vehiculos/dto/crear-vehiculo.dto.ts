import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

/**
 * Principios:
 * - SRP: Este DTO solo define contrato/validación de entrada.
 * - KISS: Validaciones claras y directas.
 * - OCP: Si mañana agregas “tipoMotor”, solo lo declaras aquí sin romper a consumidores.
 * - Decorator
 */
export class CrearVehiculoDto {
  // Formato típico Perú ABC-123
  @IsString()
  @Matches(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/i, { message: 'Formato de placa inválido. Ej: ABC-123' })
  placa!: string;

  @IsString()
  @Length(2, 40)
  marca!: string;

  @IsString()
  @Length(1, 60)
  modelo!: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  anio!: number;

  @IsString()
  @Length(3, 30)
  color!: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  vin?: string;

  /**
   * El ADMIN elige a quién se le registra el vehículo.
   * Regla: debe ser un usuario con rol CLIENTE (ver validador).
   */
  @IsInt()
  @Min(1)
  propietarioUsuarioId!: number;
}
