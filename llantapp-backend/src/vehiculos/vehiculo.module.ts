import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { PrismaService } from '../prisma/prisma.service';

// Validadores (usar la misma carpeta en todos los imports)
import { ValidadorCamposObligatorios } from './validacion/validador-campos-obligatorios';
import { ValidadorFormatoPlaca } from './validacion/validador-formato-placa';
import { ValidadorPlacaUnica } from './validacion/validador-placa-unica';
import { VEHICULO_VALIDADORES } from './validacion/tokens';

@Module({
  controllers: [VehiculosController],
  providers: [
    PrismaService,
    VehiculosService,

    // Un solo provider que retorna el ARRAY de validadores
    {
      provide: VEHICULO_VALIDADORES,
      useFactory: (prisma: PrismaService) => [
        new ValidadorCamposObligatorios(),
        new ValidadorFormatoPlaca(),
        new ValidadorPlacaUnica(prisma),
      ],
      inject: [PrismaService],
    },
  ],
  exports: [VehiculosService],
})
export class VehiculosModule {}
