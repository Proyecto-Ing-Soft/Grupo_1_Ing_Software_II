import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Matches, Min, Max } from 'class-validator';

/**
 * SRP: solo define y valida datos de entrada.
 * KISS: validaciones claras y mínimas.
 * OCP: si agregamos un campo, lo extendemos sin tocar otros.
 */
export class CrearVehiculoDto {
  @IsString() @IsNotEmpty()
  @Matches(/^[A-Z0-9-]{5,10}$/, { message: 'La placa debe tener letras/números y guiones (5-10).' })
  placa!: string;

  @IsString() @IsNotEmpty()
  marca!: string;

  @IsString() @IsNotEmpty()
  modelo!: string;

  @IsInt()
  @Min(1950) @Max(new Date().getFullYear() + 1)
  anio!: number;

  @IsString() @IsNotEmpty() @Length(3, 20)
  color!: string;

  @IsOptional() @IsString() @Length(8, 30)
  vin?: string;
}
