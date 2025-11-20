/*
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConsumiblesService } from './consumibles.service';
import { TenantSchema } from '@/common/tenant/tenant.decorator';
import { CrearConsumibleDto } from './dto/crear-consumible.dto';
import { ActualizarConsumibleDto } from './dto/actualizar-consumible.dto';
import { FiltrarConsumiblesDto } from './dto/filtrar-consumibles.dto';
import { CrearAjusteDto, CrearIngresoDto } from './dto/movimiento.dto';
// import { RolesGuard } from '@/common/tenant/roles.guard';


@Controller('consumibles')
// @UseGuards(RolesGuard)
export class ConsumiblesController {
constructor(private readonly service: ConsumiblesService) {}


@Get()
listar(@TenantSchema() schema: string, @Query() f: FiltrarConsumiblesDto) {
return this.service.listar(schema, f);
}


@Get(':id')
obtener(@TenantSchema() schema: string, @Param('id') id: string) {
return this.service.obtener(schema, Number(id));
}


@Post()
crear(@TenantSchema() schema: string, @Body() dto: CrearConsumibleDto) {
const usuarioId = 1; // TODO: req.user.usuario_id
return this.service.crear(schema, dto, usuarioId);
}


@Patch(':id')
actualizar(@TenantSchema() schema: string, @Param('id') id: string, @Body() dto: ActualizarConsumibleDto) {
return this.service.actualizar(schema, Number(id), dto);
}


@Delete(':id')
eliminar(@TenantSchema() schema: string, @Param('id') id: string) {
return this.service.eliminar(schema, Number(id));
}


@Get(':id/movimientos')
movimientos(@TenantSchema() schema: string, @Param('id') id: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
return this.service.movimientos(schema, Number(id), Number(limit ?? 50), Number(offset ?? 0));
}


@Post(':id/ingresos')
ingreso(@TenantSchema() schema: string, @Param('id') id: string, @Body() dto: CrearIngresoDto) {
const usuarioId = 1; // TODO: req.user.usuario_id
return this.service.ingreso(schema, Number(id), dto, usuarioId);
}


@Post(':id/ajustes')
ajuste(@TenantSchema() schema: string, @Param('id') id: string, @Body() dto: CrearAjusteDto) {
const usuarioId = 1; // TODO: req.user.usuario_id
return this.service.ajuste(schema, Number(id), dto, usuarioId);
}
}
*/