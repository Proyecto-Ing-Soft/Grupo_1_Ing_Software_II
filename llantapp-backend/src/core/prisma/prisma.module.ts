import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// PRINCIPIO (DIP/SRP):
// Este módulo expone una única instancia de PrismaService como dependencia compartida,
// centralizando el acceso a la base de datos (incluyendo tablas de citas y demás contexto de dominio).

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
