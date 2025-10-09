import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '../../../../common/enums/rol.enum';

export class RegistrarUsuarioDto {
  @IsString() nombreCompleto!: string;
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) clave!: string;

  // Nuevo: permite elegir rol al registrarse (si omites, por defecto CHOFER)
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}
