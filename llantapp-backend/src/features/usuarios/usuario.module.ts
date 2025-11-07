import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';

// DIP: expone UsuarioService desacoplado de detalles de Prisma.
@Module({
  imports: [PrismaModule],
  providers: [UsuarioService],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
