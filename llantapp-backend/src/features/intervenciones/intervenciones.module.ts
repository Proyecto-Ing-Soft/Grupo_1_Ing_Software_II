import { Module } from '@nestjs/common';
import { IntervencionesService } from './intervenciones.service';
import { IntervencionesController } from './intervenciones.controller';

@Module({
  controllers: [IntervencionesController],
  providers: [IntervencionesService],
})
export class IntervencionesModule {}
