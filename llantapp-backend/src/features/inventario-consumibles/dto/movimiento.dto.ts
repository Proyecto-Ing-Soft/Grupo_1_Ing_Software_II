import { IsNumber, IsOptional, IsString } from 'class-validator';


export class CrearIngresoDto {
@IsNumber()
cantidad!: number; // > 0


@IsNumber()
costo_unitario!: number; // costo del lote


@IsString() @IsOptional()
referencia?: string; // nota/OC
}


export class CrearAjusteDto {
@IsNumber() @IsOptional()
delta?: number; // +/-, si se envía delta, ignora nuevoStock


@IsNumber() @IsOptional()
nuevoStock?: number; // si envías nuevoStock, se calcula delta = nuevoStock - stock_actual


@IsString() @IsOptional()
referencia?: string;


@IsNumber() @IsOptional()
costo_unitario?: number = 0; // solo si delta>0
}