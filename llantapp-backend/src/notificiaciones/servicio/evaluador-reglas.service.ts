// src/notificaciones/servicio/evaluador-reglas.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { Notificador } from '../envio/notificador';
import { IReglaNotificacion } from '../reglas/iregla-notificacion';
import { ReglaPorKilometraje } from '../reglas/regla-por-kilometraje';
import { ReglaPorFecha } from '../reglas/regla-por-fecha';
import { ReglaVencimientoLlanta } from '../reglas/regla-vencimiento-llanta';

@Injectable()
export class EvaluadorReglasService {
  private readonly logger = new Logger(EvaluadorReglasService.name);
  private reglas: IReglaNotificacion[];

  constructor(
    private prisma: PrismaService,
    private notificador: Notificador,
  ) {
    const umbralKm = parseInt(process.env.UMBRAL_KM ?? '1000', 10);
    const umbralDias = parseInt(process.env.UMBRAL_DIAS ?? '7', 10);
    this.reglas = [
      new ReglaPorKilometraje(umbralKm),
      new ReglaPorFecha(umbralDias),
      new ReglaVencimientoLlanta(umbralDias),
    ];
  }

  @Cron(process.env.CRON_EVALUACION ?? '*/30 * * * *')
  async evaluarTodo() {
    this.logger.log('Iniciando evaluación de reglas de mantenimiento/vencimientos...');
    // Obtenemos vehículos con su chofer y sus llantas (consulta eficiente)
    const vehiculos = await this.prisma.vehiculo.findMany({
      include: {
        llantas: true,
      },
    });

    for (const v of vehiculos) {
      for (const regla of this.reglas) {
        const resultado = regla.evaluar(v as any, v.llantas);
        if (resultado?.aplica) {
          await this.notificador.enviar(resultado);
        }
      }
    }
    this.logger.log('Evaluación de reglas finalizada.');
  }
}
