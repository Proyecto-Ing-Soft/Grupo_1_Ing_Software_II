import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class SolicitudDto {
  // Empresa
  @IsString() @IsNotEmpty()
  razonSocial!: string;

  @IsString() @Matches(/^[0-9]{11}$/, { message: 'RUC inválido (11 dígitos)' })
  ruc!: string;

  // Contacto
  @IsString() @IsNotEmpty()
  contactoNombre!: string;

  @IsEmail()
  contactoCorreo!: string;

  @IsString() @IsNotEmpty()
  telefono!: string;

  // Ubicación
  @IsString() @IsNotEmpty()
  departamento!: string;

  @IsString() @IsNotEmpty()
  ciudad!: string;

  @IsString() @IsNotEmpty()
  direccion!: string;

  // Opcionales
  @IsOptional() @Matches(/^[0-9]*$/, { message: 'numSedes debe ser numérico' })
  numSedes?: string;

  @IsOptional() @IsString() @Length(0, 2000)
  mensaje?: string;

  // Metadatos
  @IsOptional() @IsString()
  pais?: string;

  @IsOptional() @IsString()
  fuente?: string;
}
