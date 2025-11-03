// calificaciones.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';

// 👇 importa el módulo de notificaciones con forwardRef si te preocupa un futuro ciclo
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [forwardRef(() => NotificacionesModule)], // 👈 FALTA
  controllers: [CalificacionesController],
  providers: [CalificacionesService, PrismaService],
  exports: [CalificacionesService],
})
export class CalificacionesModule {}
