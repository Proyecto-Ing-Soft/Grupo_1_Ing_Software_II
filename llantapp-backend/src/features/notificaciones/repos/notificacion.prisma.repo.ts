import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import {
  CrearNotificacion,
  INotificacionRepo,
  NotificacionEntidad,
} from './inotificacion.repo';
import { withTenant } from '../../../common/prisma-tenant';

// PRINCIPIO (DIP/SRP): implementación de INotificacionRepo usando Prisma + SQL,
// dejando que la BD defina estados, tipos y canales de notificación.

@Injectable()
export class NotificacionPrismaRepo implements INotificacionRepo {
  constructor(private readonly prisma: PrismaService) {}

  async crear(data: CrearNotificacion): Promise<void> {
    await withTenant(this.prisma, data.tallerSlug, async (tx) => {
      const [tipoMensaje] = await tx.$queryRaw<
        { tipo_mensaje_id: bigint }[]
      >(
        Prisma.sql`
          select tipo_mensaje_id
          from tipo_mensaje
          where codigo = ${data.tipoMensajeCodigo ?? 'resumen_tecnico'}
          limit 1
        `,
      );

      const [canal] = await tx.$queryRaw<
        { canal_notificacion_id: bigint }[]
      >(
        Prisma.sql`
          select canal_notificacion_id
          from canal_notificacion
          where codigo = ${data.canalCodigo ?? 'push'}
          limit 1
        `,
      );

      const [estadoPendiente] = await tx.$queryRaw<
        { estado_notificacion_id: bigint }[]
      >(
        Prisma.sql`
          select estado_notificacion_id
          from estado_notificacion
          where codigo = 'pendiente'
          limit 1
        `,
      );

      if (!tipoMensaje || !canal || !estadoPendiente) {
        throw new NotFoundException(
          'Configuración de notificaciones incompleta en la base de datos',
        );
      }

      await tx.$executeRaw(
        Prisma.sql`
          insert into notificacion_local (
            usuario_destinatario_id,
            tipo_mensaje_id,
            canal_notificacion_id,
            asunto,
            cuerpo_html,
            estado_notificacion_id
          )
          values (
            ${data.usuarioId},
            ${tipoMensaje.tipo_mensaje_id},
            ${canal.canal_notificacion_id},
            ${data.titulo},
            ${data.mensajeHtml},
            ${estadoPendiente.estado_notificacion_id}
          )
        `,
      );
    });
  }

  async listarPorUsuario(
    tallerSlug: string,
    usuarioId: number,
  ): Promise<NotificacionEntidad[]> {
    return withTenant(this.prisma, tallerSlug, async (tx) => {
      const rows = await tx.$queryRaw<
        {
          notificacion_local_id: bigint;
          usuario_destinatario_id: bigint;
          asunto: string;
          cuerpo_html: string;
          estado_codigo: string;
          estado_nombre: string;
          fecha_creacion: Date;
        }[]
      >(
        Prisma.sql`
          select
            nl.notificacion_local_id,
            nl.usuario_destinatario_id,
            nl.asunto,
            nl.cuerpo_html,
            e.codigo as estado_codigo,
            e.nombre as estado_nombre,
            nl.fecha_creacion
          from notificacion_local nl
          join estado_notificacion e
            on e.estado_notificacion_id = nl.estado_notificacion_id
          where nl.usuario_destinatario_id = ${usuarioId}
          order by nl.fecha_creacion desc
        `,
      );

      return rows.map((r) => ({
        id: Number(r.notificacion_local_id),
        usuarioId: Number(r.usuario_destinatario_id),
        titulo: r.asunto,
        mensajeHtml: r.cuerpo_html,
        estadoCodigo: r.estado_codigo,
        estadoNombre: r.estado_nombre,
        creadoEn: r.fecha_creacion,
      }));
    });
  }

  async marcarLeida(
    tallerSlug: string,
    id: number,
    usuarioId: number,
  ): Promise<void> {
    await withTenant(this.prisma, tallerSlug, async (tx) => {
      const [n] = await tx.$queryRaw<
        {
          notificacion_local_id: bigint;
          usuario_destinatario_id: bigint;
        }[]
      >(
        Prisma.sql`
          select
            nl.notificacion_local_id,
            nl.usuario_destinatario_id
          from notificacion_local nl
          where nl.notificacion_local_id = ${id}
          limit 1
        `,
      );

      if (!n) {
        throw new NotFoundException('No existe la notificación');
      }

      if (Number(n.usuario_destinatario_id) !== usuarioId) {
        throw new ForbiddenException('No autorizado');
      }

      const [estadoEnviado] = await tx.$queryRaw<
        { estado_notificacion_id: bigint }[]
      >(
        Prisma.sql`
          select estado_notificacion_id
          from estado_notificacion
          where codigo = 'enviado'
          limit 1
        `,
      );

      if (!estadoEnviado) {
        throw new NotFoundException(
          'Estado de notificación para lectura no configurado',
        );
      }

      await tx.$executeRaw(
        Prisma.sql`
          update notificacion_local
          set estado_notificacion_id = ${estadoEnviado.estado_notificacion_id}
          where notificacion_local_id = ${id}
        `,
      );
    });
  }
}
