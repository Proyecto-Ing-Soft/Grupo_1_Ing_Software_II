import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { withTenant } from '../../common/prisma-tenant';

// PRINCIPIOS:
// - SRP: encapsula la lógica de historial de citas por vehículo.
// - KISS: consultas claras y respuesta centrada en "cita".
// - Sin enums TS ni catálogos duplicados: estados/roles vienen de la BD.

type Solicitante = {
  id: number;
  rol: string;
};

type VehiculoRow = {
  vehiculo_id: bigint;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string | null;
  propietario_usuario_id: bigint;
};

type CitaRow = {
  cita_id: bigint;
  fecha_programada: Date;
  comentarios_cliente: string | null;
  estado_codigo: string;
  estado_nombre: string;
  servicio_id: bigint;
  servicio_nombre: string;
  mantenimiento_id: bigint | null;
  fecha_inicio_mant: Date | null;
  fecha_fin_mant: Date | null;
  resumen_tecnico_html: string | null;
};

@Injectable()
export class HistorialService {
  constructor(private readonly prisma: PrismaService) {}

  async historialPorVehiculo(
    slugTaller: string,
    vehiculoId: number,
    solicitante: Solicitante,
  ) {
    return withTenant(this.prisma, slugTaller, async (tx) => {
      // 1) Vehículo desde la BD del taller
      const vehiculos = await tx.$queryRaw<VehiculoRow[]>(
        Prisma.sql`
          select
            v.vehiculo_id,
            v.placa,
            mv.nombre as marca,
            mo.nombre as modelo,
            v.anio,
            v.color,
            v.propietario_usuario_id
          from vehiculo v
          join app.marca_vehiculo mv
            on mv.marca_vehiculo_id = v.marca_vehiculo_id
          join app.modelo_vehiculo mo
            on mo.modelo_vehiculo_id = v.modelo_vehiculo_id
          where v.vehiculo_id = ${vehiculoId}
          limit 1
        `,
      );

      const vehiculo = vehiculos[0];

      if (!vehiculo) {
        throw new NotFoundException('Vehículo no encontrado');
      }

      const propietarioId = Number(vehiculo.propietario_usuario_id);

      // 2) Roles del solicitante desde la BD (no usamos enums locales)
      const rolesSolicitante = await tx.$queryRaw<{ codigo: string }[]>(
        Prisma.sql`
          select r.codigo
          from usuario_rol ur
          join app.rol r on r.rol_id = ur.rol_id
          where ur.usuario_id = ${solicitante.id}
        `,
      );

      const codigosRol = rolesSolicitante.map((r) => r.codigo);

      const esPropietario = propietarioId === solicitante.id;
      // Consideramos "personal del taller" a quien tenga algún rol distinto de "CLIENTE".
      const esTaller = codigosRol.some((codigo) => codigo !== 'CLIENTE');

      if (!esPropietario && !esTaller) {
        throw new ForbiddenException(
          'No tienes permisos para ver el historial de este vehículo',
        );
      }

      // 3) Citas asociadas al vehículo (toda info viene por joins)
      const citas = await tx.$queryRaw<CitaRow[]>(
        Prisma.sql`
          select
            c.cita_id,
            c.fecha_programada,
            c.comentarios_cliente,
            ec.codigo as estado_codigo,
            ec.nombre as estado_nombre,
            s.servicio_id,
            s.nombre as servicio_nombre,
            m.mantenimiento_id,
            m.fecha_inicio as fecha_inicio_mant,
            m.fecha_fin as fecha_fin_mant,
            m.resumen_tecnico_html
          from cita c
          join estado_cita ec
            on ec.estado_cita_id = c.estado_cita_id
          join servicio s
            on s.servicio_id = c.servicio_id
          left join mantenimiento m
            on m.cita_id = c.cita_id
          where c.vehiculo_id = ${vehiculoId}
          order by c.fecha_programada desc
        `,
      );

      const ahora = new Date();

      const citasRealizadas = citas.filter(
        (c) => c.fecha_programada <= ahora,
      );
      const proximasCitas = citas.filter(
        (c) => c.fecha_programada > ahora,
      );

      // 4) Respuesta: se habla en términos de CITA, no de "mantenimiento" como entidad principal.
      return {
        vehiculo: {
          id: Number(vehiculo.vehiculo_id),
          placa: vehiculo.placa,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          anio: vehiculo.anio,
          color: vehiculo.color,
        },
        citasRealizadas: citasRealizadas.map((c) => ({
          id: Number(c.cita_id),
          fechaCita: c.fecha_programada,
          estadoCodigo: c.estado_codigo,
          estadoNombre: c.estado_nombre,
          servicio: {
            id: Number(c.servicio_id),
            nombre: c.servicio_nombre,
          },
          // Detalle opcional proveniente del mantenimiento,
          // expuesto como información de la cita.
          detalleTrabajoHtml: c.resumen_tecnico_html,
          fechaInicioTrabajo: c.fecha_inicio_mant,
          fechaFinTrabajo: c.fecha_fin_mant,
        })),
        proximasCitas: proximasCitas.map((c) => ({
          id: Number(c.cita_id),
          fechaCita: c.fecha_programada,
          estadoCodigo: c.estado_codigo,
          estadoNombre: c.estado_nombre,
          servicio: {
            id: Number(c.servicio_id),
            nombre: c.servicio_nombre,
          },
          comentariosCliente: c.comentarios_cliente,
        })),
      };
    });
  }
}
