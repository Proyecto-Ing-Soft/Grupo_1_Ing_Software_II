// src/vehiculos/vehiculos.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { IValidadorVehiculo } from './validacion/ivalidador-vehiculo';
import { VALIDADOR_VEHICULO } from './validacion/tokens';

@Injectable()
export class VehiculosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VALIDADOR_VEHICULO) private readonly validador: IValidadorVehiculo,
  ) {}

  async crear(dto: CrearVehiculoDto, usuarioId: number) {
    await this.validador.validar(dto);
    return this.prisma.vehiculo.create({ data: { ...dto, creadoPorId: usuarioId } });
  }
}
