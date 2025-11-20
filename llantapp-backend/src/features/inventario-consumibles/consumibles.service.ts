/*
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantDbService } from '@/common/db/tenant-db.service';
import { PrismaService } from '@/common/db/prisma.service';
import { CrearConsumibleDto } from './dto/crear-consumible.dto';
import { ActualizarConsumibleDto } from './dto/actualizar-consumible.dto';
import { FiltrarConsumiblesDto } from './dto/filtrar-consumibles.dto';
import { CrearIngresoDto, CrearAjusteDto } from './dto/movimiento.dto';


@Injectable()
export class ConsumiblesService {
constructor(private readonly tenant: TenantDbService) {}


async listar(schema: string, f: FiltrarConsumiblesDto) {
return this.tenant.withTenant(schema, async (tx: PrismaService) => {
const rows = await tx.$queryRaw<any[]>`
select c.consumible_id, c.codigo, c.nombre,
c.stock_actual, c.stock_minimo_alerta, c.costo_unitario, c.activo,
um.codigo as unidad_codigo, cp.nombre as categoria
from consumible c
join app.unidad_medida um on um.unidad_medida_id = c.unidad_medida_id
join app.categoria_producto cp on cp.categoria_producto_id = c.categoria_producto_id
where (${f.q ?? null} is null or c.nombre ilike '%' || ${f.q ?? null} || '%' or c.codigo ilike '%' || ${f.q ?? null} || '%')
and (${f.activos ?? null} is null or c.activo = ${f.activos ?? null})
and (${f.solo_bajo_minimo ?? null} is null or (${f.solo_bajo_minimo ?? null} = false) or (c.stock_actual < c.stock_minimo_alerta))
order by c.nombre
limit ${f.limit ?? 50} offset ${f.offset ?? 0};
`;
return rows;
});
}


async obtener(schema: string, id: number) {
return this.tenant.withTenant(schema, async (tx: { $queryRaw: any; }) => {
const [row] = await tx.$queryRaw<any[]>`select * from consumible where consumible_id = ${id};`;
if (!row) throw new NotFoundException('Consumible no encontrado');
return row;
});
}


async crear(schema: string, dto: CrearConsumibleDto, usuarioId: number) {
return this.tenant.withTenant(schema, async (tx: { $queryRaw: any; }) => {
const existing = await tx.$queryRaw<any[]>`select 1 from consumible where codigo = ${dto.codigo} limit 1;`;
if (existing.length) throw new BadRequestException('Código ya existe');


const [created] = await tx.$queryRaw<any[]>`
insert into consumible(codigo, nombre, categoria_producto_id, unidad_medida_id, stock_actual, stock_minimo_alerta, costo_unitario, activo)
`}
*/