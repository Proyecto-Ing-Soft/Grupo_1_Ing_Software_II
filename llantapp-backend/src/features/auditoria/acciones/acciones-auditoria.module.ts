import { Module } from '@nestjs/common';
import { AccionesAuditoriaService } from './acciones-auditoria.service';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { AccionesAuditoriaController } from './acciones-auditoria.controller';

@Module({
  controllers: [AccionesAuditoriaController],
  providers: [AccionesAuditoriaService, PrismaService],
  exports: [AccionesAuditoriaService],
})
export class AccionesAuditoriaModule {}
