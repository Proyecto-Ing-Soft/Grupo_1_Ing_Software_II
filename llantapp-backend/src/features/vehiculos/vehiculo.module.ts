import { Module } from '@nestjs/common';
import { VehiculosController } from './vehiculos.controller';
import { VehiculosService } from './vehiculos.service';
import { PrismaModule } from '../../core/prisma/prisma.module';

import { ValidadorCamposObligatorios } from './validacion/validador-campos-obligatorios';
import { ValidadorFormatoPlaca } from './validacion/validador-formato-placa';
import { ValidadorPlacaUnica } from './validacion/validador-placa-unica';
import { ValidadorPropietarioValido } from './validacion/validador-propietario-valido';
import { VEHICULO_VALIDADORES } from './validacion/tokens';

// DIP: ensambla validadores y servicio sin acoplarlos entre sí.
@Module({
  imports: [PrismaModule],
  controllers: [VehiculosController],
  providers: [
    VehiculosService,
    ValidadorCamposObligatorios,
    ValidadorFormatoPlaca,
    ValidadorPlacaUnica,
    ValidadorPropietarioValido,
    {
      provide: VEHICULO_VALIDADORES,
      useFactory: (
        campos: ValidadorCamposObligatorios,
        formato: ValidadorFormatoPlaca,
        placaUnica: ValidadorPlacaUnica,
        propietario: ValidadorPropietarioValido,
      ) => [campos, formato, placaUnica, propietario],
      inject: [
        ValidadorCamposObligatorios,
        ValidadorFormatoPlaca,
        ValidadorPlacaUnica,
        ValidadorPropietarioValido,
      ],
    },
  ],
  exports: [VehiculosService],
})
export class VehiculosModule {}
