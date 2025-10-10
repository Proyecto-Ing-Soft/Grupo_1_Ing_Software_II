import { Module } from '@nestjs/common';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';

@Module({
  controllers: [HistorialController],
  providers: [HistorialService, PrismaService],
  exports: [HistorialService],
})
export class HistorialModule {}
