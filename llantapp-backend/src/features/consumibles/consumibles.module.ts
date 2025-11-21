import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { ConsumiblesService } from './consumibles.service';
import { ConsumiblesController } from './consumibles.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones/notificaciones.module';

@Module({
  imports: [
    NotificacionesModule, // para inyectar Notificador en ConsumiblesService
  ],
  controllers: [ConsumiblesController],
  providers: [PrismaService, ConsumiblesService],
  exports: [ConsumiblesService],
})
export class ConsumiblesModule {}
