// PRINCIPIOS:
// - SRP: manejar solo solicitudes de taller + aprobación/rechazo.
// - KISS: flujos claros; usar transacción para aprobar.
// - DRY: helpers para mapear a “view” y generar password.

import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import {
  CrearSolicitudTallerDto,
  RechazarSolicitudTallerDto,
} from './dto/crear-solicitud-taller.dto';
import * as bcrypt from 'bcryptjs';
import { Rol } from '@prisma/client';

@Injectable()
export class SolicitudesTallerService {
  constructor(private readonly prisma: PrismaService) {}

  private toView(s: any) {
    return {
      id: s.id,
      razonSocial: s.razonSocial,
      ruc: s.ruc,
      direccion: s.direccion,
      telefono: s.telefono,
      emailContacto: s.emailContacto,
      nombreContacto: s.nombreContacto,
      adminNombre: s.adminNombre,
      adminEmail: s.adminEmail,
      estado: s.estado,
      motivoRechazo: s.motivoRechazo ?? null,
      tallerId: s.tallerId ?? null,
      creadoEn: s.creadoEn.toISOString(),
    };
  }

  // === PÚBLICO: crear solicitud ===
  async crear(dto: CrearSolicitudTallerDto) {
    const creada = await this.prisma.solicitudTaller.create({
      data: {
        razonSocial: dto.razonSocial.trim(),
        ruc: dto.ruc.trim(),
        direccion: dto.direccion?.trim() || null,
        telefono: dto.telefono?.trim() || null,
        emailContacto: dto.emailContacto.toLowerCase().trim(),
        nombreContacto: dto.nombreContacto.trim(),
        adminNombre: dto.adminNombre.trim(),
        adminEmail: dto.adminEmail.toLowerCase().trim(),
      },
    });

    return this.toView(creada);
  }

  // === OWNER: listar pendientes ===
  async listarPendientes() {
    const filas = await this.prisma.solicitudTaller.findMany({
      where: { estado: 'PENDIENTE' },
      orderBy: { creadoEn: 'asc' },
    });
    return filas.map((s) => this.toView(s));
  }

  // helper password aleatoria simple (para demo)
  private generarPasswordInicial(): string {
    return Math.random().toString(36).slice(-8); // 8 chars
  }

  // === OWNER: aprobar ===
  async aprobar(id: number, ownerId: number) {
    // Tip: podrías validar aquí que ownerId tenga rol OWNER con otra consulta
    const solicitud = await this.prisma.solicitudTaller.findUnique({ where: { id } });
    if (!solicitud) throw new BadRequestException('Solicitud no existe');

    if (solicitud.estado === 'APROBADA') {
      throw new BadRequestException('La solicitud ya fue aprobada');
    }
    if (solicitud.estado === 'RECHAZADA') {
      throw new BadRequestException('La solicitud ya fue rechazada');
    }

    const passwordPlano = this.generarPasswordInicial();
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1) Crear taller
      const taller = await tx.taller.create({
        data: {
          nombre: solicitud.razonSocial,
          ruc: solicitud.ruc,
          direccion: solicitud.direccion,
          telefono: solicitud.telefono,
          emailContacto: solicitud.emailContacto,
        },
      });

      // 2) Crear usuario admin inicial
      const admin = await tx.usuario.create({
        data: {
          nombreCompleto: solicitud.adminNombre,
          correo: solicitud.adminEmail, // campo correcto del modelo
          hashClave: passwordHash,      // usamos el hash correcto
          rol: Rol.ADMIN,
          tallerId: taller.id,
        },
      });

      // 3) Actualizar solicitud
      const solAct = await tx.solicitudTaller.update({
        where: { id: solicitud.id },
        data: {
          estado: 'APROBADA',
          tallerId: taller.id,
        },
      });

      return { taller, admin, solicitud: solAct };
    });

    // Devolvemos info necesaria para que el OWNER vea los datos
    return {
      solicitud: this.toView(resultado.solicitud),
      taller: {
        id: resultado.taller.id,
        nombre: resultado.taller.nombre,
      },
      adminInicial: {
        id: resultado.admin.id,
        nombreCompleto: resultado.admin.nombreCompleto,
        email: resultado.admin.correo, // el modelo tiene "correo"; lo exponemos como "email"
        passwordInicial: passwordPlano, // SOLO para mostrar una vez; no guardar esto
      },
    };
  }

  // === OWNER: rechazar ===
  async rechazar(id: number, dto: RechazarSolicitudTallerDto, _ownerId: number) {
    const solicitud = await this.prisma.solicitudTaller.findUnique({ where: { id } });
    if (!solicitud) throw new BadRequestException('Solicitud no existe');

    if (solicitud.estado !== 'PENDIENTE') {
      throw new BadRequestException('Solo se pueden rechazar solicitudes pendientes');
    }

    const actualizada = await this.prisma.solicitudTaller.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        motivoRechazo: dto.motivoRechazo?.trim() || 'Rechazada por el owner',
      },
    });

    return this.toView(actualizada);
  }
}
