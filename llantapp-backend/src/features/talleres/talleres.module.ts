// llantapp-backend/src/features/talleres/talleres.module.ts
// Módulo de Nest que agrupa el controller público de talleres.

import { Module } from '@nestjs/common';
import { TalleresController } from './talleres.controller';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';

@Module({
  controllers: [TalleresController],
  providers: [PrismaService],
})
export class TalleresModule {}
