// src/citas/dto/crear-cita.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, Min, Max, Length, Matches } from 'class-validator';

export enum TipoMantenimiento {
  PREVENTIVO = 'PREVENTIVO',
  CORRECTIVO = 'CORRECTIVO',
  LEGAL_ITV = 'LEGAL_ITV',
  EXTRAS = 'EXTRAS',
}

export class CrearCitaDto {
  @IsEnum(TipoMantenimiento)
  tipo!: TipoMantenimiento;

  @IsInt()
  @Min(1)
  vehiculoId!: number;

  @IsInt()
  @Min(1)
  mecanicoId!: number;

  @IsString()
  @Length(5, 1000)
  comentario!: string;

  // Fecha opcional en formato YYYY-MM-DD (sin hora)
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'programadaPara debe ser YYYY-MM-DD' })
  programadaPara?: string;
}
