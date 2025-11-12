import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';


export class FiltrarConsumiblesDto {
@IsString() @IsOptional()
q?: string;


@IsBoolean() @IsOptional()
activos?: boolean;


@IsBoolean() @IsOptional()
solo_bajo_minimo?: boolean;


@IsNumber() @IsOptional()
limit?: number = 50;


@IsNumber() @IsOptional()
offset?: number = 0;
}