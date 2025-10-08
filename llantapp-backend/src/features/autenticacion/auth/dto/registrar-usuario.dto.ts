import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistrarUsuarioDto {
  // SRP: Solo validaciones de entrada.
  @IsString() nombreCompleto!: string;
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) clave!: string;
}