import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { Rol as PrismaRol } from '@prisma/client';

// SRP: Solo valida existencia y rol del propietario elegido.
// DIP: Depende de PrismaService (abstracción de acceso a datos en tu app).

@Injectable()
export class ValidadorPropietarioValido extends ValidadorBase {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validar(dto: CrearVehiculoDto) {
    if (!dto.propietarioUsuarioId) return 'Propietario inválido';

    const propietario = await this.prisma.usuario.findUnique({
      where: { id: dto.propietarioUsuarioId },
      select: { id: true, rol: true, empresaId: true },
    });

    if (!propietario) return 'Propietario no existe';
    if (propietario.rol !== PrismaRol.CLIENTE) {
      return 'El propietario debe ser CLIENTE';
    }

    return null;
  }
}