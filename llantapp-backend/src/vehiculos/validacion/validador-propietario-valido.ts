import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * SRP: Solo valida existencia y rol del propietario elegido.
 * DIP: Depende de PrismaService (abstracción de acceso a datos en tu app).
 */
@Injectable()
export class ValidadorPropietarioValido extends ValidadorBase {
  constructor(private readonly prisma: PrismaService) { super(); }

  async validar(dto: CrearVehiculoDto) {
    if (!dto.propietarioUsuarioId) return 'Propietario inválido';

    const u = await this.prisma.usuario.findUnique({
      where: { id: dto.propietarioUsuarioId },
      select: { id: true, rol: true, empresaId: true },
    });

    if (!u) return 'Propietario no existe';
    if (u.rol !== 'CHOFER' && u.rol !== 'EMPRESA') {
      return 'El propietario debe ser CHOFER o EMPRESA';
    }
    return null;
  }
}
