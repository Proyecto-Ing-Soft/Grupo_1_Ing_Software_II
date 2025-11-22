// PRINCIPIOS:
// - SRP: adaptar HTTP ⇄ Service para consumibles.
// - Seguridad: solo ADMIN puede gestionar inventario (salvo activos-lite para mecánico).

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
  UnauthorizedException,
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
    // Permitimos OWNER como súper admin opcionalmente
    if (rol !== 'ADMIN' && rol !== 'OWNER') {
      throw new ForbiddenException(
        'Solo un administrador puede gestionar consumibles',
      );
    }
  }

  private getUserId(req: any): number {
    const userId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return userId;
  }

  // ============================================
  // US-20: catálogo reducido para mecánico
  // GET /consumibles/activos-lite
  // ============================================
  @Get('activos-lite')
  async listarActivosLite(@Req() req: any) {
    const usuarioId = this.getUserId(req);
    // Puede ser mecánico, admin o owner; se filtra por su taller en el service
    return this.svc.listarActivosLite(usuarioId);
  }

  // ============================================
  // Rutas de administración (ADMIN / OWNER)
  // ============================================

  @Get()
  async listar(@Req() req: any) {
    this.assertAdmin(req);
    const adminId = this.getUserId(req);
    return this.svc.listar(adminId);
  }

  @Get(':id')
  async detalle(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.assertAdmin(req);
    const adminId = this.getUserId(req);
    return this.svc.buscarPorId(id, adminId);
  }

  @Post()
  async crear(@Body() dto: CrearConsumibleDto, @Req() req: any) {
    this.assertAdmin(req);
    const adminId = this.getUserId(req);
    // 🔴 ANTES: this.svc.crear(dto, adminId)
    // ✅ AHORA:
    return this.svc.crear(adminId, dto);
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarConsumibleDto,
    @Req() req: any,
  ) {
    this.assertAdmin(req);
    const adminId = this.getUserId(req);
    // 🔴 ANTES: this.svc.actualizar(id, dto, adminId)
    // ✅ AHORA:
    return this.svc.actualizar(id, adminId, dto);
  }

  @Delete(':id')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.assertAdmin(req);
    const adminId = this.getUserId(req);
    return this.svc.eliminar(id, adminId);
  }
}
