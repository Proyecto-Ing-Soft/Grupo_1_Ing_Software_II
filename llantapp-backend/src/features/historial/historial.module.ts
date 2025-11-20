// [SIN CAMBIOS]
import { Module } from '@nestjs/common';
import { HistorialController } from './historial.controller';
import { HistorialService } from './historial.service';
import { PrismaModule } from '../../core/prisma/prisma.module';

// PRINCIPIO (DIP): se obtiene PrismaService vía PrismaModule, sin instanciarlo a mano.

@Module({
 imports: [PrismaModule],
 controllers: [HistorialController],
 providers: [HistorialService],
 exports: [HistorialService],
})
export class HistorialModule {}