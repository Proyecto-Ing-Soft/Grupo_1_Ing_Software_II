import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';
import { Notificador } from './envio/notificador';

@Module({
  controllers: [NotificacionesController],
  providers: [PrismaService, NotificacionPrismaRepo, NotificacionesService, Notificador],
  exports: [Notificador],
})
export class NotificacionesModule {}

