import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearSolicitudTallerDto {
  @IsString()
  @IsNotEmpty()
  razonSocial!: string;

  @IsString()
  @IsNotEmpty()
  ruc!: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEmail()
  emailContacto!: string;

  @IsString()
  @IsNotEmpty()
  nombreContacto!: string;

  @IsString()
  @IsNotEmpty()
  adminNombre!: string;

  @IsEmail()
  adminEmail!: string;
}

export class RechazarSolicitudTallerDto {
  @IsString()
  @IsNotEmpty()
  motivoRechazo!: string;
}
