import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// PRINCIPIO (SRP):
// Este servicio se encarga únicamente de gestionar la conexión a la BD.
// PRINCIPIO (DIP):
// Expone PrismaClient como dependencia inyectable para los casos de uso (citas, notificaciones, etc.).

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  [model: string]: any;

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
