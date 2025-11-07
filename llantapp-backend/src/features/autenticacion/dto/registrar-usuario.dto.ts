// SRP: define el contrato para registrar usuarios.
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Los códigos de rol válidos se obtienen desde la base de datos.
export class RegistrarUsuarioDto {
  @IsString()
  nombreCompleto!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(8)
  clave!: string;

  @IsOptional()
  @IsString()
  rol?: string;
}
