import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';


export class ActualizarConsumibleDto {
@IsString() @IsOptional()
nombre?: string;


@IsNumber() @IsOptional()
categoria_producto_id?: number;


@IsNumber() @IsOptional()
unidad_medida_id?: number;


@IsNumber() @IsOptional()
stock_minimo_alerta?: number;


@IsNumber() @IsOptional()
costo_unitario?: number;


@IsBoolean() @IsOptional()
activo?: boolean;
}