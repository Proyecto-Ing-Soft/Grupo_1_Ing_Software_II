import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Rol } from '../../../../common/enums/rol.enum';

export class RegistrarUsuarioDto {
  @IsString()
  nombreCompleto!: string;

  @IsEmail()
  correo!: string;

  @IsString()
  @MinLength(8)
  clave!: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;

  /**
   * Taller fijo al que pertenece el usuario.
   * - Para CLIENTE: taller donde se atiende.
   * - Para ADMIN/MECANICO: taller donde trabaja.
   */
  @IsOptional()
  @IsInt()
  tallerId?: number;
}
