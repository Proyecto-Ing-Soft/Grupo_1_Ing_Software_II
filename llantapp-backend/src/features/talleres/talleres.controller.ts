// llantapp-backend/src/features/talleres/talleres.controller.ts
// SRP: Exponer endpoints de lectura de talleres para consumo público (registro de clientes).
// KISS: Un GET sencillo que devuelve id + nombre de cada taller.

import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';

@Controller()
export class TalleresController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista "lite" de talleres para el frontend (registro de clientes).
   * Ruta: GET /talleres-lite
   *
   * Devuelve solo:
   *  - id
   *  - nombre
   */
  @Get('talleres-lite')
  async listarLite() {
    const talleres = await this.prisma.taller.findMany({
      select: {
        id: true,
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return talleres;
  }
}
