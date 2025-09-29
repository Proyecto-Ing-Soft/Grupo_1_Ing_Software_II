import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { IValidadorVehiculo } from './validacion/ivalidador-vehiculo';
import { VEHICULO_VALIDADORES } from './validacion/tokens';

@Injectable()
export class VehiculosService {
  constructor(
    private prisma: PrismaService,
    @Inject(VEHICULO_VALIDADORES) private readonly validadores: IValidadorVehiculo[],
  ) {}

  listarDelPropietario(usuarioId: number) {
    return this.prisma.vehiculo.findMany({
      where: { propietarioUsuarioId: usuarioId },
      select: { id: true, placa: true, marca: true, modelo: true },
      orderBy: { id: 'desc' },
    });
  }

  async crear(dto: CrearVehiculoDto, creadorId: number) {
    const errores: string[] = [];
    for (const v of this.validadores) {
      const msg = await v.validar(dto);
      if (msg) errores.push(...(Array.isArray(msg) ? msg : [msg]));
    }
    if (errores.length) throw new BadRequestException(errores.join(' | '));

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: creadorId },
      select: { empresaId: true },
    });

    return this.prisma.vehiculo.create({
      data: {
        placa: dto.placa.trim().toUpperCase(),
        marca: dto.marca.trim(),
        modelo: dto.modelo.trim(),
        anio: dto.anio,
        color: dto.color.trim(),
        vin: dto.vin?.trim() || null,

        propietarioUsuarioId: creadorId,
        creadoPorId: creadorId,
        empresaId: usuario?.empresaId ?? null,
      },
      select: { id: true, placa: true, marca: true, modelo: true },
    });
  }
}
