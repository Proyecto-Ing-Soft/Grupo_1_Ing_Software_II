import { Body, Controller, Post, Req } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @Post()
  async crear(@Body() dto: CrearVehiculoDto, @Req() req: any) {
    // Asume que en el request traes slug y userId del JWT/tenant-resolver.
    const slugTaller: string = req.user.tallerSlug;  // p.ej. "sandar_a"
    const creadorUsuarioId: number = req.user.usuarioId;

    const vehiculo = await this.service.crear(slugTaller, dto, creadorUsuarioId);
    return vehiculo;
  }
}
