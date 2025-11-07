import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';
import { Notificador } from './envio/notificador';
import { PrismaModule } from '../../core/prisma/prisma.module';

// PRINCIPIO (DIP): se usa PrismaModule para obtener PrismaService compartido.

@Module({
  imports: [PrismaModule],
  controllers: [NotificacionesController],
  providers: [NotificacionPrismaRepo, NotificacionesService, Notificador],
  exports: [NotificacionesService, Notificador],
})
export class NotificacionesModule {}
