import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';


export class CrearConsumibleDto {
@IsString() @IsNotEmpty()
codigo!: string;


@IsString() @IsNotEmpty()
nombre!: string;


@IsNumber()
categoria_producto_id!: number; // app.categoria_producto


@IsNumber()
unidad_medida_id!: number; // app.unidad_medida


@IsNumber() @IsOptional()
stock_minimo_alerta?: number = 0;


@IsNumber() @IsOptional()
stock_actual?: number = 0; // opcional: seed inicial con un ingreso


@IsNumber() @IsOptional()
costo_unitario?: number = 0;


@IsBoolean() @IsOptional()
activo?: boolean = true;
}