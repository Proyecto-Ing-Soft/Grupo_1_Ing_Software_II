import { Module, forwardRef } from '@nestjs/common';
import { CalificacionesController } from './calificaciones.controller';
import { CalificacionesService } from './calificaciones.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

// DIP: ensambla dependencias sin acoplar la lógica a detalles de infraestructura.
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificacionesModule),
  ],
  controllers: [CalificacionesController],
  providers: [CalificacionesService],
  exports: [CalificacionesService],
})
export class CalificacionesModule {}
