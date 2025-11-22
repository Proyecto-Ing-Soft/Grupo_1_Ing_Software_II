import { Body, Controller, Post } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudDto } from './dto/solicitud.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly svc: SolicitudesService) {}

  @Post()
  async crear(@Body() dto: SolicitudDto) {
    return this.svc.registrar(dto);
  }
}
