import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

// PRINCIPIO (DIP): el módulo inyecta dependencias (NotificacionesModule),
// sin acoplar CitasService a implementaciones concretas fuera de este contexto.

@Module({
  imports: [NotificacionesModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
