// usuario.module.ts
import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    PrismaService, 
    UsuarioService,
  ],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
