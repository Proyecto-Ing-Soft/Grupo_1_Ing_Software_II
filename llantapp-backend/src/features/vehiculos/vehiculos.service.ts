import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { withTenant } from '../../common/prisma-tenant';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { VEHICULO_VALIDADORES } from './validacion/tokens';
import { IValidadorVehiculo } from './validacion/ivalidador-vehiculo';

type VehiculoMin = {
  vehiculoId: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string | null;
  alias: string | null;
};

// SRP: coordina validaciones y persistencia de vehículos usando catálogos de BD y esquema del taller.
@Injectable()
export class VehiculosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(VEHICULO_VALIDADORES)
    private readonly validadores: IValidadorVehiculo[],
  ) {}

  async crear(
    slugTaller: string,
    dto: CrearVehiculoDto,
    creadorUsuarioId: number,
  ): Promise<VehiculoMin> {
    // Ejecutar cadena de validadores.
    const mensajes: string[] = [];
    for (const v of this.validadores) {
      const r = await v.validar(slugTaller, dto, creadorUsuarioId);
      if (typeof r === 'string' && r.trim()) {
        mensajes.push(r.trim());
      } else if (Array.isArray(r)) {
        for (const m of r) {
          const s = m?.toString().trim();
          if (s) mensajes.push(s);
        }
      }
    }

    if (mensajes.length) {
      throw new BadRequestException(mensajes.join(' | '));
    }

    try {
      // Validar relación modelo↔marca en catálogos globales (schema app).
      const modelo = await this.prisma.$queryRaw<
        Array<{ modelo_vehiculo_id: bigint }>
      >(Prisma.sql`
        SELECT m.modelo_vehiculo_id
        FROM app.modelo_vehiculo m
        WHERE m.modelo_vehiculo_id = ${dto.modeloVehiculoId}
          AND m.marca_vehiculo_id = ${dto.marcaVehiculoId}
        LIMIT 1
      `);

      if (modelo.length === 0) {
        throw new BadRequestException(
          'Modelo y marca de vehículo no son consistentes',
        );
      }

      // Insertar en el esquema del taller correspondiente.
      return await withTenant(
        this.prisma,
        slugTaller,
        async (tx): Promise<VehiculoMin> => {
          const placa = dto.placa.trim().toUpperCase();

          const inserted = await tx.$queryRaw<
            Array<{ vehiculo_id: bigint }>
          >(Prisma.sql`
            INSERT INTO vehiculo (
              propietario_usuario_id,
              creador_usuario_id,
              placa,
              vin,
              marca_vehiculo_id,
              modelo_vehiculo_id,
              anio,
              color,
              alias
            )
            VALUES (
              ${dto.propietarioUsuarioId},
              ${creadorUsuarioId},
              ${placa},
              ${dto.vin ?? null},
              ${dto.marcaVehiculoId},
              ${dto.modeloVehiculoId},
              ${dto.anio},
              ${dto.color ?? null},
              ${dto.alias ?? null}
            )
            RETURNING vehiculo_id
          `);

          if (!inserted.length) {
            throw new InternalServerErrorException(
              'No se pudo registrar el vehículo',
            );
          }

          const vehiculoIdNum = Number(inserted[0].vehiculo_id);

          // Historial de propietario inicial.
          await tx.$executeRaw(
            Prisma.sql`
              INSERT INTO vehiculo_propietario_hist (
                vehiculo_id,
                propietario_usuario_id,
                fecha_inicio
              )
              VALUES (
                ${vehiculoIdNum},
                ${dto.propietarioUsuarioId},
                now()
              )
            `,
          );

          // Respuesta mínima enriquecida con catálogos globales.
          const rows = await tx.$queryRaw<
            Array<{
              vehiculo_id: bigint;
              placa: string;
              marca: string;
              modelo: string;
              anio: number;
              color: string | null;
              alias: string | null;
            }>
          >(Prisma.sql`
            SELECT
              v.vehiculo_id,
              v.placa,
              ma.nombre AS marca,
              mo.nombre AS modelo,
              v.anio,
              v.color,
              v.alias
            FROM vehiculo v
            JOIN app.marca_vehiculo  ma
              ON ma.marca_vehiculo_id  = v.marca_vehiculo_id
            JOIN app.modelo_vehiculo mo
              ON mo.modelo_vehiculo_id = v.modelo_vehiculo_id
            WHERE v.vehiculo_id = ${vehiculoIdNum}
          `);

          if (!rows.length) {
            throw new InternalServerErrorException(
              'No se pudo obtener el vehículo registrado',
            );
          }

          const row = rows[0];
          return {
            vehiculoId: Number(row.vehiculo_id),
            placa: row.placa,
            marca: row.marca,
            modelo: row.modelo,
            anio: row.anio,
            color: row.color,
            alias: row.alias,
          };
        },
      );
    } catch (e: any) {
      // Unique constraint (placa) a nivel de taller.
      if (e?.code === '23505' || e?.meta?.code === 'P2002') {
        throw new ConflictException(
          'La placa ya existe en este taller',
        );
      }

      if (
        e instanceof BadRequestException ||
        e instanceof ConflictException
      ) {
        throw e;
      }

      throw new InternalServerErrorException(
        'No se pudo registrar el vehículo',
      );
    }
  }
}
