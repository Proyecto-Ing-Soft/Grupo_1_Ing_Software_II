import { Body, Controller, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { RolRequerido } from '../common/decorators/rol-requerido.decorator';
import { Rol } from '../common/enums/rol.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiculosController {
  constructor(private readonly servicio: VehiculosService) {}

  @Post()
  @RolRequerido(Rol.ADMIN, Rol.MECANICO)
  async crear(@Body() dto: CrearVehiculoDto, @Req() req: any) {
    // JwtAuthGuard coloca { sub, rol, ... } en req.user
    const uidRaw = req.user?.sub ?? req.user?.id;      // ← lee 'sub' (fallback a 'id' si así lo firmaras)
    const uid = Number(uidRaw);
    if (!Number.isFinite(uid)) {
      throw new UnauthorizedException('Token sin id válido');
    }
    return this.servicio.crear(dto, uid);
  }
}
