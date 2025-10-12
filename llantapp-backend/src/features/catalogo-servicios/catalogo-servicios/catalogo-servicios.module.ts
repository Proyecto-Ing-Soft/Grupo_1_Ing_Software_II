// PRINCIPIOS
// - SRP: declara controller y service del catálogo.
// - DI: PrismaService como provider compartido.

import { Module } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { CatalogoServiciosService } from './catalogo-servicios.service';
import { CatalogoServiciosController } from './catalogo-servicios.controller';

@Module({
  controllers: [CatalogoServiciosController],
  providers: [PrismaService, CatalogoServiciosService],
  exports: [CatalogoServiciosService],
})
export class CatalogoServiciosModule {}
