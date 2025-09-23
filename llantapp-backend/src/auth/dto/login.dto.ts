// dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @IsEmail() correo!: string;
  @IsString() @MinLength(8) clave!: string;
}
