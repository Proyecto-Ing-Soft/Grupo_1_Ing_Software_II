// llantapp-backend/src/features/usuarios/usuario/dto/usuarios-por-rol.dto.ts
import { IsEnum, IsOptional, IsBooleanString } from 'class-validator';
import { Rol } from '../../../../common/enums/rol.enum';

export class UsuariosPorRolQueryDto {
  @IsOptional()
  @IsEnum(Rol, { message: 'rol inválido. Usa: ADMIN|MECANICO|CLIENTE' })
  rol?: Rol;

  // true|false (string porque viene de querystring)
  @IsOptional()
  @IsBooleanString({ message: 'soloActivos debe ser true o false' })
  soloActivos?: string;
}
