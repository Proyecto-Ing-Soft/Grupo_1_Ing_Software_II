import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CalificacionDto {
  @IsInt() @Min(1) @Max(5)
  estrellas!: number;

  @IsOptional() @IsString()
  comentario?: string;
}
