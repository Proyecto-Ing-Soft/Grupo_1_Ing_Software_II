import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '../../../common/enums/rol.enum';

export class RegistrarUsuarioDto {
  @IsString() nombreCompleto!: string;
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) clave!: string;
  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}
