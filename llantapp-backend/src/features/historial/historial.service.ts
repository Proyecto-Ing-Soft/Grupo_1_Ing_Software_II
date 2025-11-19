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

// CAMBIO: El tipo CitaRow ahora incluye los campos que el frontend necesita
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
 detalle_trabajo: string | null; // El frontend espera 'descripcion_trabajos'
 mecanico_nombres: string | null; // El frontend espera 'mecanico' (string)
 mecanico_apellidos: string | null;
 tiene_evidencia: boolean; // El frontend espera 'tiene_evidencia'
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
     // 1) Vehículo (sin cambios)
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

     // 2) Permisos (sin cambios)
     const propietarioId = Number(vehiculo.propietario_usuario_id);
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
     const esTaller = codigosRol.some((codigo) => codigo !== 'CLIENTE');

     if (!esPropietario && !esTaller) {
       throw new ForbiddenException(
         'No tienes permisos para ver el historial de este vehículo',
       );
     }

     // 3) CAMBIO: Citas asociadas (SQL modificado para incluir mecánico y evidencia)
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
           m.descripcion_trabajos as detalle_trabajo,
           
           -- Mecánico (asumiendo 1 activo por cita)
           asig_u.nombres as mecanico_nombres,
           asig_u.apellidos as mecanico_apellidos,
           
           -- Evidencia (ligada al mantenimiento)
           EXISTS (
             SELECT 1 FROM evidencia ev 
             WHERE ev.mantenimiento_id = m.mantenimiento_id
           ) as tiene_evidencia

         from cita c
         join estado_cita ec
           on ec.estado_cita_id = c.estado_cita_id
         join servicio s
           on s.servicio_id = c.servicio_id
         left join mantenimiento m
           on m.cita_id = c.cita_id
         
         -- Join para mecánico
         left join asignacion asig
           on asig.cita_id = c.cita_id AND asig.activo = true
         left join usuario asig_u
           on asig_u.usuario_id = asig.mecanico_usuario_id

         where c.vehiculo_id = ${vehiculoId}
         order by c.fecha_programada desc
       `,
     );

     // CAMBIO: Lógica de filtrado por estado, no por fecha
     const trabajosRealizados = citas.filter(
       (c) => c.estado_codigo === 'terminada',
     );
     const proximosServicios = citas.filter(
       (c) => c.estado_codigo === 'solicitada' || c.estado_codigo === 'en_progreso' || c.estado_codigo === 'asignada',
     );

     // 4) CAMBIO: La respuesta se adapta al contrato del frontend
     return {
       vehiculo: {
         id: Number(vehiculo.vehiculo_id),
         placa: vehiculo.placa,
         marca: vehiculo.marca,
         modelo: vehiculo.modelo,
         anio: vehiculo.anio,
         color: vehiculo.color,
       },
       // Clave 'trabajosRealizados' como espera el frontend
       trabajosRealizados: trabajosRealizados.map((c) => ({
         // El ID debe ser el del mantenimiento, para la evidencia
         id: Number(c.mantenimiento_id),
         tipo: c.servicio_nombre,
         fecha_fin: c.fecha_fin_mant ?? c.fecha_programada, // Fallback
         descripcion_trabajos: c.detalle_trabajo,
         mecanico: [c.mecanico_nombres, c.mecanico_apellidos].filter(Boolean).join(' ') || '—',
         tiene_evidencia: c.tiene_evidencia,
       })),
       // Clave 'proximosServicios' como espera el frontend
       proximosServicios: proximosServicios.map((c) => ({
         id: Number(c.cita_id),
         tipo: c.servicio_nombre,
         estado: c.estado_nombre, // El frontend usa el nombre legible
         fecha_programada: c.fecha_programada,
         comentarios_cliente: c.comentarios_cliente,
         mecanico: [c.mecanico_nombres, c.mecanico_apellidos].filter(Boolean).join(' ') || null,
       })),
     };
   });
 }
}