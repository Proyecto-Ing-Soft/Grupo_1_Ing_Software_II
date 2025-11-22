import { Module } from '@nestjs/common';
import { SolicitudesTallerController } from './solicitudes-taller.controller';
import { SolicitudesTallerService } from './solicitudes-taller.service';
import { PrismaModule } from '../../core/prisma/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolicitudesTallerController],
  providers: [SolicitudesTallerService],
})
export class SolicitudesTallerModule {}
