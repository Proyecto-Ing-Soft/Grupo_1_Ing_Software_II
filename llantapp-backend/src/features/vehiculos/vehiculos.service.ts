// Lógica: valida relación modelo↔marca en app.*, inserta vehiculo en esquema tenant,
// registra historial de propietario y devuelve un "VehiculoMin" con join a catálogos.

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { withTenant } from '../../common/prisma-tenant';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';

type VehiculoMin = {
  vehiculoId: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string | null;
  alias: string | null;
};

@Injectable()
export class VehiculosService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crea un vehículo en el esquema del taller del usuario autenticado.
   * @param slugTaller slug del tenant (sin "taller_")
   * @param dto payload con IDs estrictos
   * @param creadorUsuarioId usuario que realiza la operación (auditoría)
   */
  async crear(slugTaller: string, dto: CrearVehiculoDto, creadorUsuarioId: number): Promise<VehiculoMin> {
    try {
      // 1) Validar que el modelo pertenece a la marca en los catálogos globales (schema app)
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
        // El modelo no pertenece a la marca o alguno no existe.
        throw new BadRequestException('Modelo y marca no son consistentes');
      }

      // 2) Ejecutar dentro del esquema tenant usando search_path local
      return await withTenant(this.prisma, slugTaller, async (tx) => {
        // 2.1) Insertar vehículo (unique(placa) en tabla del tenant)
        const vehiculo = await tx.$queryRaw<
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
            ${dto.placa},
            ${dto.vin ?? null},
            ${dto.marcaVehiculoId},
            ${dto.modeloVehiculoId},
            ${dto.anio},
            ${dto.color ?? null},
            ${dto.alias ?? null}
          )
          RETURNING vehiculo_id
        `);

        const vehiculoIdNum = Number(vehiculo[0].vehiculo_id);

        // 2.2) Insertar historial de propietario (fecha_inicio = now)
        await tx.$executeRaw(Prisma.sql`
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
        `);

        // 2.3) SELECT de respuesta con join a catálogos (usando app.* vía search_path)
        const result = await tx.$queryRaw<
          Array<{
            vehiculo_id: bigint; placa: string; marca: string; modelo: string;
            anio: number; color: string | null; alias: string | null;
          }>
        >(Prisma.sql`
          SELECT v.vehiculo_id,
                 v.placa,
                 ma.nombre AS marca,
                 mo.nombre AS modelo,
                 v.anio,
                 v.color,
                 v.alias
          FROM vehiculo v
          JOIN app.marca_vehiculo  ma ON ma.marca_vehiculo_id  = v.marca_vehiculo_id
          JOIN app.modelo_vehiculo mo ON mo.modelo_vehiculo_id = v.modelo_vehiculo_id
          WHERE v.vehiculo_id = ${vehiculoIdNum}
        `);

        const row = result[0];
        return {
          vehiculoId: Number(row.vehiculo_id),
          placa: row.placa,
          marca: row.marca,
          modelo: row.modelo,
          anio: row.anio,
          color: row.color,
          alias: row.alias,
        };
      });
    } catch (e: any) {
      // Manejo de constraint unique(placa) → 23505 (unique_violation)
      if (e?.code === '23505' || e?.meta?.code === 'P2002') {
        throw new ConflictException('La placa ya existe');
      }
      // Errores propagados (BadRequest para modelo/marca inconsistente)
      if (e instanceof BadRequestException || e instanceof ConflictException) {
        throw e;
      }
      // Para debugging, puedes loguear e
      throw new InternalServerErrorException('No se pudo registrar el vehículo');
    }
  }
}
