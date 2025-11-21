// SRP: DTO específico para el caso de uso "enviar promoción".
// KISS: solo los campos mínimos necesarios para el MVP.

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsArray, IsInt } from 'class-validator';

export class EnviarPromocionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(120, { message: 'El título no debe superar 120 caracteres' })
  titulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(1000, { message: 'El mensaje no debe superar 1000 caracteres' })
  mensaje!: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  usuarios?: number[];
}