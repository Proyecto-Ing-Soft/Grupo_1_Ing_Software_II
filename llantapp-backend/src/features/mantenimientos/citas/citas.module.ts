// llantapp-backend/src/features/mantenimientos/citas/citas.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { NotificacionesModule } from '../../notificaciones/notificaciones/notificaciones.module';
import { AccionesAuditoriaModule } from '../../auditoria/acciones/acciones-auditoria.module';

// 🔹 IMPORTANTE: importar el módulo que exporta ConsumiblesService
import { ConsumiblesModule } from '../../consumibles/consumibles.module';

@Module({
  imports: [
    NotificacionesModule,      // para inyectar Notificador / NotificacionesService
    AccionesAuditoriaModule,   // para inyectar AccionesAuditoriaService
    ConsumiblesModule,         // US-20: para inyectar ConsumiblesService en CitasService
  ],
  controllers: [CitasController],
  providers: [PrismaService, CitasService],
  exports: [CitasService],
})
export class CitasModule {}
