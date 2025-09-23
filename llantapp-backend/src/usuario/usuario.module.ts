// usuario.module.ts
import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';

@Module({ providers: [UsuarioService], controllers: [UsuarioController], exports: [UsuarioService] })
export class UsuarioModule {}
