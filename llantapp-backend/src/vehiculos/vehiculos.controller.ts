import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';

@UseGuards(JwtAuthGuard)
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly svc: VehiculosService) {}

  // === Endpoint que tu frontend está llamando ===
  @Get('mios')
  async mios(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.svc.listarDelPropietario(uid);
  }

  // Registrar vehículo (opcional, para tu pantalla de registro)
  @Post()
  async crear(@Body() dto: CrearVehiculoDto, @Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.svc.crear(dto, uid);
  }
}
