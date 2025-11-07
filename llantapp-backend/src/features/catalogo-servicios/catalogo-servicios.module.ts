// DIP/SRP: módulo del catálogo, ensambla controlador y servicio usando PrismaModule compartido.
import { Module } from '@nestjs/common';
import { CatalogoServiciosService } from './catalogo-servicios.service';
import { CatalogoServiciosController } from './catalogo-servicios.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogoServiciosController],
  providers: [CatalogoServiciosService],
  exports: [CatalogoServiciosService],
})
export class CatalogoServiciosModule {}
