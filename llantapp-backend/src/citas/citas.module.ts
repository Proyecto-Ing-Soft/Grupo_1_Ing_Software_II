import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { NotificacionesModule } from '../notificiaciones/notificaciones.module';

@Module({
  imports: [NotificacionesModule], // ← para inyectar Notificador
  controllers: [CitasController],
  providers: [PrismaService, CitasService],
})
export class CitasModule {}
