// SRP: DTO para filtrar usuarios por el código de rol definido en la base de datos.
import { IsOptional, IsString } from 'class-validator';

export class UsuariosPorRolQueryDto {
  @IsOptional()
  @IsString()
  rol?: string; // Debe coincidir con rol.codigo en BD.
}
