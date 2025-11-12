
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { FiltrarBitacoraDto } from './dto/filtrar-bitacora.dto';

@Injectable()
export class BitacoraService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(tallerSlug: string, filtros: FiltrarBitacoraDto) {
    const [taller]: any[] = await this.prisma.$queryRawUnsafe(
      `select taller_id from app.taller where slug = $1 limit 1`,
      tallerSlug,
    );
    if (!taller) return [];

    const conds: string[] = ['t.taller_id = $1'];
    const params: any[] = [taller.taller_id];
    let p = 2;

    if (filtros.estado) {
      conds.push(`e.codigo = $${p++}`); params.push(filtros.estado);
    }
    if (filtros.canal) {
      conds.push(`c.codigo = $${p++}`); params.push(filtros.canal);
    }
    if (filtros.desde) {
      conds.push(`b.fecha_intento >= $${p++}`); params.push(new Date(filtros.desde));
    }
    if (filtros.hasta) {
      conds.push(`b.fecha_intento <= $${p++}`); params.push(new Date(filtros.hasta));
    }
    if (filtros.destinatario) {
      conds.push(`b.destinatario ilike $${p++}`); params.push(`%${filtros.destinatario}%`);
    }

    const sql = `
      select b.bitacora_notificacion_id as id,
             b.destinatario,
             b.fecha_intento,
             b.fecha_envio,
             b.error_detalle,
             e.codigo as estado,
             c.codigo as canal,
             tm.codigo as tipo
      from app.bitacora_notificacion b
      join app.taller t on t.taller_id = b.taller_id
      join app.estado_notificacion e on e.estado_notificacion_id = b.estado_notificacion_id
      join app.canal_notificacion c on c.canal_notificacion_id = b.canal_notificacion_id
      join app.tipo_mensaje tm on tm.tipo_mensaje_id = b.tipo_mensaje_id
      where ${conds.join(' and ')}
      order by b.fecha_intento desc
      limit 500
    `;
    return this.prisma.$queryRawUnsafe(sql, ...params);
  }

  async detalle(id: number) {
    const sql = `
      select b.*, e.codigo as estado_codigo, c.codigo as canal_codigo, tm.codigo as tipo_codigo
      from app.bitacora_notificacion b
      join app.estado_notificacion e on e.estado_notificacion_id = b.estado_notificacion_id
      join app.canal_notificacion c on c.canal_notificacion_id = b.canal_notificacion_id
      join app.tipo_mensaje tm on tm.tipo_mensaje_id = b.tipo_mensaje_id
      where b.bitacora_notificacion_id = $1
      limit 1
    `;
    const rows: any[] = await this.prisma.$queryRawUnsafe(sql, id);
    return rows?.[0] ?? null;
  }
}
