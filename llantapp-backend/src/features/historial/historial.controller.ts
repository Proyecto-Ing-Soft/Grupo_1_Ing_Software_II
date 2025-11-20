import {
 BadRequestException,
 Controller,
 Get,
 Param,
 ParseIntPipe,
 Req,
 UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { HistorialService } from './historial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// PRINCIPIO (SRP): Este controlador solo orquesta HTTP.
// Se "monta" sobre la ruta 'vehiculos' para mantener
// la API RESTful (el historial es un sub-recurso de un vehículo).

type JwtUser = {
 id: number;
 rol?: string;
 tallerSlug?: string; // CAMBIO: 'tallerSlug' es el nuevo 'schema'
 [k: string]: any;
};

type RequestWithUser = Request & { user: JwtUser };

// Esta función implementa la lógica multi-tenant
function getSlugTaller(req: RequestWithUser): string {
 const header = (req.headers['x-taller-slug'] as string | undefined)?.trim();
 const fromUser =
   typeof req.user?.tallerSlug === 'string'
     ? req.user.tallerSlug.trim()
     : undefined;

 const slug = header || fromUser;

 if (!slug) {
   throw new BadRequestException(
     'Falta el identificador del taller (x-taller-slug)',
   );
 }

 return slug;
}

// CAMBIO: El controlador ahora maneja la ruta /vehiculos
@Controller('vehiculos')
export class HistorialController {
 constructor(private readonly historial: HistorialService) {}

 @UseGuards(JwtAuthGuard)
 // CAMBIO: La ruta ahora es /:id/historial para coincidir con el frontend
 @Get(':id/historial')
 async porVehiculo(
   // CAMBIO: El nombre del parámetro ahora es 'id'
   @Param('id', ParseIntPipe) vehiculoId: number,
   @Req() req: RequestWithUser,
 ) {
   const usuario = req.user;

   return this.historial.historialPorVehiculo(getSlugTaller(req), vehiculoId, {
     id: usuario.id,
     rol: String(usuario.rol ?? ''),
   });
 }
}