import { IsEnum, IsOptional } from 'class-validator';
import { Rol } from '../../../common/enums/rol.enum';

export class UsuariosPorRolQueryDto {
  @IsOptional()
  @IsEnum(Rol, { message: 'rol inválido. Usa: ADMIN|MECANICO|CLIENTE' })
  rol?: Rol;
}
