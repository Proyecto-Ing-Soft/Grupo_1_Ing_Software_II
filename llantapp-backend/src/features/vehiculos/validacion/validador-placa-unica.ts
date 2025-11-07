import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { withTenant } from '../../../common/prisma-tenant';
import { Prisma } from '@prisma/client';

// SRP: verifica en la BD del taller que la placa no esté registrada.
@Injectable()
export class ValidadorPlacaUnica extends ValidadorBase {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validar(
    slugTaller: string,
    dto: CrearVehiculoDto,
    _creadorUsuarioId: number,
  ) {
    const placa = dto.placa?.trim().toUpperCase();
    if (!placa) return 'Placa inválida';

    const existe = await withTenant(
      this.prisma,
      slugTaller,
      async (tx) => {
        const rows = await tx.$queryRaw<
          Array<{ vehiculo_id: bigint }>
        >(Prisma.sql`
          SELECT vehiculo_id
          FROM vehiculo
          WHERE placa = ${placa}
          LIMIT 1
        `);
        return rows.length > 0;
      },
    );

    if (existe) {
      return 'La placa ya está registrada en este taller';
    }

    return null;
  }
}
