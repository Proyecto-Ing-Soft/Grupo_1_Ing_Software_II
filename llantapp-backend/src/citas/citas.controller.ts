// src/citas/citas.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CitasService, EstadoCita } from './citas.service';
import { CrearCitaDto } from './dto/crear-cita.dto';

@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
  constructor(private readonly servicio: CitasService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async crear(@Body() dto: CrearCitaDto, @Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.servicio.crear(dto, uid);
  }

  @Get('mias')
  async mias(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.servicio.listarPorCliente(uid);
  }

  @Get('asignadas')
  async asignadas(@Req() req: any) {
    const mid = req.user?.sub ?? req.user?.id;
    return this.servicio.listarPorMecanico(mid);
  }

  @Post(':id/aceptar')
  async aceptar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const mid = req.user?.sub ?? req.user?.id;
    const permitidos: EstadoCita[] = ['SOLICITADA'];
    return this.servicio.cambiarEstado(id, mid, 'ACEPTADA', permitidos);
  }

  @Post(':id/iniciar')
  async iniciar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const mid = req.user?.sub ?? req.user?.id;
    const permitidos: EstadoCita[] = ['ACEPTADA'];
    return this.servicio.cambiarEstado(id, mid, 'EN_PROGRESO', permitidos);
  }

  @Post(':id/terminar')
  async terminar(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const mid = req.user?.sub ?? req.user?.id;
    const permitidos: EstadoCita[] = ['EN_PROGRESO'];
    return this.servicio.cambiarEstado(id, mid, 'TERMINADA', permitidos);
  }
}
