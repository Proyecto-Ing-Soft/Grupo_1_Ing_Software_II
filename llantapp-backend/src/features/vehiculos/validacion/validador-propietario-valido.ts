import { Injectable } from '@nestjs/common';
import { ValidadorBase } from './validador-base';
import { CrearVehiculoDto } from '../dto/crear-vehiculo.dto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { withTenant } from '../../../common/prisma-tenant';
import { Prisma } from '@prisma/client';

// SRP: valida que el propietario exista en el taller y tenga rol CLIENTE según BD.
@Injectable()
export class ValidadorPropietarioValido extends ValidadorBase {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validar(
    slugTaller: string,
    dto: CrearVehiculoDto,
    _creadorUsuarioId: number,
  ) {
    const propietarioId = dto.propietarioUsuarioId;
    if (!propietarioId) {
      return 'Propietario inválido';
    }

    // Obtenemos el rol CLIENTE desde la tabla app.rol (sin enums locales).
    const rolRows = await this.prisma.$queryRaw<
      Array<{ rol_id: bigint }>
    >(Prisma.sql`
      SELECT rol_id
      FROM app.rol
      WHERE codigo = 'CLIENTE'
      LIMIT 1
    `);

    const rolCliente = rolRows[0];
    if (!rolCliente) {
      return 'Rol CLIENTE no está configurado en la base de datos';
    }

    // Verificamos en el esquema del taller que el usuario tenga ese rol.
    const esValido = await withTenant(
      this.prisma,
      slugTaller,
      async (tx) => {
        const rows = await tx.$queryRaw<
          Array<{ usuario_id: bigint }>
        >(Prisma.sql`
          SELECT u.usuario_id
          FROM usuario u
          JOIN usuario_rol ur
            ON ur.usuario_id = u.usuario_id
          WHERE u.usuario_id = ${propietarioId}
            AND ur.rol_id = ${rolCliente.rol_id}
          LIMIT 1
        `);
        return rows.length === 1;
      },
    );

    if (!esValido) {
      return 'El propietario debe existir en el taller y tener rol CLIENTE';
    }

    return null;
  }
}
