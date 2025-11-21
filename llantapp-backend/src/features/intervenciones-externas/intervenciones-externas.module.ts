import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { IntervencionesExternasService } from './intervenciones-externas.service';
import { IntervencionesExternasController } from './intervenciones-externas.controller';

@Module({
  controllers: [IntervencionesExternasController],
  providers: [PrismaService, IntervencionesExternasService],
  exports: [IntervencionesExternasService],
})
export class IntervencionesExternasModule {}
