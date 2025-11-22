import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import type { Usuario, Rol as PrismaRol } from '@prisma/client';
import { Rol as AppRol } from '../../../common/enums/rol.enum';
import { Encriptador } from '../../autenticacion/autenticacion/encriptador';

// Helper de conversión (mismo literal -> cast seguro)
const toPrismaRol = (r: AppRol): PrismaRol => r as unknown as PrismaRol;

type TallerRolLiteral = AppRol.ADMIN | AppRol.MECANICO;

@Injectable()
export class UsuarioService {
  private enc = new Encriptador();

  constructor(private prisma: PrismaService) {}

  // =========================
  // CRUD base (reusables)
  // =========================
  async crear(datos: {
    nombreCompleto: string;
    correo: string;
    hashClave: string;
    rol?: AppRol;
    tallerId?: number | null;
  }): Promise<Usuario> {
    const rol = toPrismaRol(datos.rol ?? AppRol.CLIENTE);
    return this.prisma.usuario.create({
      data: {
        nombreCompleto: datos.nombreCompleto,
        correo: datos.correo,
        hashClave: datos.hashClave,
        rol,
        tallerId: datos.tallerId ?? null,
      },
    });
  }

  async buscarPorCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  // ✅ incluye el taller
  async buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: {
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  // =========================
  // Listados
  // =========================

  // Listado general por rol (sin filtro de taller).
  async listarPorRol(rol: AppRol) {
    return this.prisma.usuario.findMany({
      where: { rol: toPrismaRol(rol) },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  // 🔹 listado por rol limitado al taller del actor
  async listarPorRolEnTaller(
    rol: AppRol,
    actorId: number,
    soloActivos = false,
  ) {
    const actor = await this.prisma.usuario.findUnique({
      where: { id: actorId },
      select: { id: true, rol: true, tallerId: true },
    });

    if (!actor) {
      throw new NotFoundException('Usuario autenticado no encontrado');
    }

    if (!actor.tallerId) {
      return [];
    }

    return this.prisma.usuario.findMany({
      where: {
        rol: toPrismaRol(rol),
        tallerId: actor.tallerId,
        ...(soloActivos ? { activo: true } : {}),
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  async listarPorRoles(roles: AppRol[]) {
    return this.prisma.usuario.findMany({
      where: { rol: { in: roles.map(toPrismaRol) } },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  // 🔹 lista ADMIN + MECÁNICO del taller del admin autenticado
  async listarPersonalDeTallerDeAdmin(actorId: number) {
    const actor = await this.prisma.usuario.findUnique({
      where: { id: actorId },
      select: { id: true, rol: true, tallerId: true },
    });

    if (!actor) {
      throw new NotFoundException('Usuario autenticado no encontrado');
    }

    if (!actor.tallerId) {
      throw new BadRequestException('El usuario no tiene un taller asociado');
    }

    return this.prisma.usuario.findMany({
      where: {
        tallerId: actor.tallerId,
        rol: {
          in: [toPrismaRol(AppRol.ADMIN), toPrismaRol(AppRol.MECANICO)],
        },
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  // =========================
  // Taller: crear / actualizar / activar / desactivar / clave
  // =========================

  /**
   * Crear personal del taller (ADMIN o MECANICO) con clave en texto plano.
   * Valida rol permitido y unicidad de correo.
   */
  async crearPersonalTaller(input: {
    nombreCompleto: string;
    correo: string;
    clave: string;
    rol: TallerRolLiteral; // ADMIN | MECANICO
    tallerId?: number | null;
  }) {
    const { nombreCompleto, correo, clave, rol, tallerId } = input;

    if (rol !== AppRol.ADMIN && rol !== AppRol.MECANICO) {
      throw new BadRequestException('Rol inválido: solo ADMIN o MECANICO');
    }

    const existente = await this.prisma.usuario.findUnique({
      where: { correo },
    });
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashClave = await this.enc.hashear(clave);

    const creado = await this.prisma.usuario.create({
      data: {
        nombreCompleto,
        correo,
        hashClave,
        rol: toPrismaRol(rol),
        tallerId: tallerId ?? null,
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });

    return creado;
  }

  private async validarActorYUsuarioTaller(
    actorId: number,
    id: number,
  ): Promise<{
    actor: { id: number; tallerId: number | null };
    existente: {
      id: number;
      rol: PrismaRol;
      correo: string;
      tallerId: number | null;
      activo: boolean;
    };
  }> {
    const actor = await this.prisma.usuario.findUnique({
      where: { id: actorId },
      select: { id: true, rol: true, tallerId: true },
    });

    if (!actor) {
      throw new NotFoundException('Usuario autenticado no encontrado');
    }
    if (!actor.tallerId) {
      throw new ForbiddenException('No tienes un taller asociado');
    }

    const existente = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        rol: true,
        correo: true,
        tallerId: true,
        activo: true,
      },
    });
    if (!existente) throw new NotFoundException('Usuario no encontrado');

    const isTaller =
      existente.rol === toPrismaRol(AppRol.ADMIN) ||
      existente.rol === toPrismaRol(AppRol.MECANICO);
    if (!isTaller) {
      throw new BadRequestException('Solo se puede gestionar personal de taller');
    }

    if (existente.tallerId !== actor.tallerId) {
      throw new ForbiddenException('No puedes modificar usuarios de otro taller');
    }

    return { actor: { id: actor.id, tallerId: actor.tallerId }, existente };
  }

  /**
   * Actualizar datos de un usuario del taller (solo ADMIN | MECANICO).
   */
  async actualizarPersonalTaller(
    actorId: number,
    id: number,
    dto: { nombreCompleto?: string; correo?: string; rol?: TallerRolLiteral },
  ) {
    const { existente } = await this.validarActorYUsuarioTaller(actorId, id);

    if (dto.rol && dto.rol !== AppRol.ADMIN && dto.rol !== AppRol.MECANICO) {
      throw new BadRequestException('Rol inválido: solo ADMIN o MECANICO');
    }

    if (dto.correo && dto.correo !== existente.correo) {
      const dupe = await this.prisma.usuario.findUnique({
        where: { correo: dto.correo },
      });
      if (dupe) throw new ConflictException('El correo ya está registrado');
    }

    return this.prisma.usuario.update({
      where: { id },
      data: {
        nombreCompleto: dto.nombreCompleto,
        correo: dto.correo,
        rol: dto.rol ? toPrismaRol(dto.rol) : undefined,
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * "Eliminar" usuario del taller = DESACTIVAR (activo=false).
   */
  async desactivarPersonalTaller(actorId: number, id: number) {
    await this.validarActorYUsuarioTaller(actorId, id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * Activar nuevamente un usuario del taller.
   */
  async activarPersonalTaller(actorId: number, id: number) {
    await this.validarActorYUsuarioTaller(actorId, id);

    return this.prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * Cambiar contraseña de un usuario del taller.
   */
  async cambiarClavePersonalTaller(
    actorId: number,
    id: number,
    nuevaClave: string,
  ) {
    await this.validarActorYUsuarioTaller(actorId, id);

    const hashClave = await this.enc.hashear(nuevaClave);

    return this.prisma.usuario.update({
      where: { id },
      data: { hashClave },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        activo: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  // =========================
  // Mapper público
  // =========================
  aPublico(u: any) {
    const { hashClave, ...resto } = u;
    return resto;
  }
}
