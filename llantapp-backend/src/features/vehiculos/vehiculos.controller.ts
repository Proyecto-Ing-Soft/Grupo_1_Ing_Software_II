import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// SRP: orquesta HTTP ⇄ VehiculosService.
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async crear(@Body() dto: CrearVehiculoDto, @Req() req: any) {
    const headerSlug = req.headers['x-taller-slug'] as
      | string
      | undefined;
    const slugTaller =
      headerSlug?.trim() ||
      (req.user?.tallerSlug as string | undefined)?.trim();

    if (!slugTaller) {
      throw new BadRequestException(
        'Debe especificarse el taller mediante header x-taller-slug',
      );
    }

    const creadorUsuarioId = Number(req.user?.id ?? req.user?.sub);
    if (!Number.isFinite(creadorUsuarioId)) {
      throw new UnauthorizedException('Usuario no válido');
    }

    return this.service.crear(slugTaller, dto, creadorUsuarioId);
  }
}
