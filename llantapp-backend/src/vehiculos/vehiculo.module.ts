import { Module } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { VehiculosController } from './vehiculos.controller';
import { PrismaService } from '../prisma/prisma.service';

import { IValidadorVehiculo } from './validacion/ivalidador-vehiculo';
import { ValidadorCamposObligatorios } from './validacion/validador-campos-obligatorios';
import { ValidadorFormatoPlaca } from './validacion/validador-formato-placa';
import { ValidadorPlacaUnica } from './validacion/validador-placa-unica';
import { VALIDADOR_VEHICULO } from './validacion/tokens';

function construirCadena(prisma: PrismaService): IValidadorVehiculo {
  const v1 = new ValidadorCamposObligatorios();
  const v2 = v1.encadenar(new ValidadorFormatoPlaca());
  v2.encadenar(new ValidadorPlacaUnica(prisma));
  return v1;
}

@Module({
  controllers: [VehiculosController],
  providers: [
    PrismaService,
    VehiculosService,
    {
      provide: VALIDADOR_VEHICULO,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => construirCadena(prisma),
    },
  ],
 
})
export class VehiculoModule {}
