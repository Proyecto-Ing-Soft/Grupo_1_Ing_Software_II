import { Body, Controller, Get, Post, Req, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';

// Autorización por rol
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RolRequerido } from '../../../common/decorators/rol-requerido.decorator';
import { Rol } from '../../../common/enums/rol.enum';

@UseGuards(JwtAuthGuard) // SRP: este guard SOLO valida token (autenticación)
@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly svc: VehiculosService) {}

  @Get('mios')
  async mios(@Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.svc.listarDelPropietario(uid);
  }

  /**
   * POST /vehiculos
   * Principios/patrones:
   * - SRP: El controller NO valida negocio; delega a VehiculosService.
   * - DIP: El servicio depende de una ABSTRACCIÓN (IValidadorVehiculo[]).
   * - OCP: Puedes agregar validadores sin tocar este método.
   * - Seguridad por capas: JwtAuthGuard -> RolesGuard (autenticación → autorización).
   *
   * Diagrama de secuencia (pasos):
   * UI (usuario ID) -> Controller (POST) -> Service.validar() -> Prisma.create() -> Respuesta 201(TODO SALIO BIEN)/400(ERROR).
   */
  @UseGuards(RolesGuard) // Aplica qué rol puede acceder
  @RolRequerido(Rol.MECANICO) // SOLO MECANICO
  @Post()
  async crear(@Body() dto: CrearVehiculoDto, @Req() req: any) {
    const uid = req.user?.sub ?? req.user?.id;
    return this.svc.crear(dto, uid);
  }

  @Get(':id/historial')
  async obtenerHistorial(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    // El ID del usuario que hace la petición se extrae del token JWT
    const usuario = req.user;
    return this.svc.obtenerHistorial(id, usuario);
  }

  @UseGuards(RolesGuard)
  @RolRequerido(Rol.MECANICO, Rol.ADMIN)
  @Post('desde-cita/:citaId')
  crearDesdeCita(
    @Param('citaId', ParseIntPipe) citaId: number,
    @Body() dto: CrearVehiculoDto,
    @Req() req: any
  ) {
    const usuario = req.user; // { sub, rol }
    const creador = { id: Number(usuario?.sub ?? usuario?.id), rol: usuario?.rol };
    return this.svc.crearYEnlazarCita(citaId, dto, creador);
  }
}