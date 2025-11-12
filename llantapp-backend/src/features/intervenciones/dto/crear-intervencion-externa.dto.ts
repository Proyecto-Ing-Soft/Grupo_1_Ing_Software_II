import { IsDateString, IsInt, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';

export class CrearIntervencionExternaDto {
  @IsInt()
  vehiculoId!: number;

  @IsDateString()
  fecha!: string;

  @IsString()
  @MinLength(5)
  descripcion!: string;

  @IsOptional()
  @IsUrl()
  comprobanteUrl?: string;
}
