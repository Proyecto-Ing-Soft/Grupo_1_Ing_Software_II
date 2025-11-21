// PRINCIPIOS:
// - SRP: adaptar HTTP ⇄ Service para consumibles.
// - Seguridad: solo ADMIN puede gestionar inventario.

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConsumiblesService } from './consumibles.service';
import { CrearConsumibleDto } from './dto/crear-consumible.dto';
import { ActualizarConsumibleDto } from './dto/actualizar-consumible.dto';

@UseGuards(JwtAuthGuard)
@Controller('consumibles')
export class ConsumiblesController {
  constructor(private readonly svc: ConsumiblesService) {}

  private assertAdmin(req: any) {
    const rol = req.user?.rol;
    if (rol !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede gestionar consumibles');
    }
  }

  @Get()
  async listar(@Req() req: any) {
    this.assertAdmin(req);
    return this.svc.listarTodos();
  }

  @Get(':id')
  async detalle(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.assertAdmin(req);
    return this.svc.buscarPorId(id);
  }

  @Post()
  async crear(@Body() dto: CrearConsumibleDto, @Req() req: any) {
    this.assertAdmin(req);
    return this.svc.crear(dto);
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarConsumibleDto,
    @Req() req: any,
  ) {
    this.assertAdmin(req);
    return this.svc.actualizar(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    this.assertAdmin(req);
    return this.svc.eliminar(id);
  }
}
