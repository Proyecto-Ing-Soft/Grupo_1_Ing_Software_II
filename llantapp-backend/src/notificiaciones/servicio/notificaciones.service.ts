// src/notificaciones/servicio/notificaciones.service.ts
import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { INotificacionRepo } from '../repos/inotificacion.repo';

@Injectable()
export class NotificacionesService {
  constructor(
  @Inject('INotificacionRepo') 
  private readonly repo: INotificacionRepo) {}

  listarMias(usuarioId: number) {
    return this.repo.listarPorUsuario(usuarioId);
  }

  async marcarLeida(id: number, usuarioId: number) {
    // Podrías validar pertenencia si lo necesitas estrictamente:
    const lista = await this.repo.listarPorUsuario(usuarioId);
    if (!lista.find(n => n.id === id)) {
      throw new ForbiddenException('No puedes cambiar esta notificación');
    }
    await this.repo.marcarLeida(id, usuarioId);
    return { ok: true };
  }
}
