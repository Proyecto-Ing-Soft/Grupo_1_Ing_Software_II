// src/notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './servicio/notificaciones.service';
import { EvaluadorReglasService } from './servicio/evaluador-reglas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionPrismaRepo } from './repos/notificacion.prisma.repo';
import { Notificador } from './envio/notificador';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificacionesController],
  providers: [
    PrismaService,
    NotificacionesService,
    EvaluadorReglasService,
    Notificador,
    { provide: 'INotificacionRepo', useClass: NotificacionPrismaRepo },
    // Vincula el token al parámetro del constructor si prefieres inyección por token:
    { provide: NotificacionPrismaRepo, useClass: NotificacionPrismaRepo },
  ],
  exports: [],
})
export class NotificacionesModule {}
