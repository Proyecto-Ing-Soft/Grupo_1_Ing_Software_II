// llantapp-backend/src/features/usuarios/usuario/usuario.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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

  // ✅ aquí ya incluimos el taller
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
  async listarPorRol(rol: AppRol) {
    return this.prisma.usuario.findMany({
      where: { rol: toPrismaRol(rol) },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        creadoEn: true,
        // ⬇ info del taller
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
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  async listarTaller() {
    return this.prisma.usuario.findMany({
      where: {
        rol: { in: [toPrismaRol(AppRol.ADMIN), toPrismaRol(AppRol.MECANICO)] },
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  // =========================
  // Taller: crear / actualizar / eliminar
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
  }) {
    const { nombreCompleto, correo, clave, rol } = input;

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
      },
      select: {
        id: true,
        nombreCompleto: true,
        correo: true,
        rol: true,
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });

    return creado;
  }

  /**
   * Actualizar datos de un usuario del taller (solo ADMIN | MECANICO).
   * No cambia la clave (para eso expondrías otro caso de uso).
   */
  async actualizarPersonalTaller(
    id: number,
    dto: { nombreCompleto?: string; correo?: string; rol?: TallerRolLiteral },
  ) {
    const existente = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, rol: true, correo: true },
    });
    if (!existente) throw new NotFoundException('Usuario no encontrado');

    const isTaller =
      existente.rol === toPrismaRol(AppRol.ADMIN) ||
      existente.rol === toPrismaRol(AppRol.MECANICO);
    if (!isTaller)
      throw new BadRequestException('Solo se puede actualizar personal de taller');

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
        creadoEn: true,
        taller: {
          select: { id: true, nombre: true },
        },
      },
    });
  }

  /**
   * Eliminar un usuario del taller (solo ADMIN | MECANICO).
   */
  async eliminarPersonalTaller(id: number) {
    const existente = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, rol: true },
    });
    if (!existente) throw new NotFoundException('Usuario no encontrado');

    if (
      existente.rol !== toPrismaRol(AppRol.ADMIN) &&
      existente.rol !== toPrismaRol(AppRol.MECANICO)
    ) {
      throw new BadRequestException('Solo se puede eliminar personal de taller');
    }

    await this.prisma.usuario.delete({ where: { id } });
    return { ok: true };
  }

  // =========================
  // Mapper público
  // =========================
  aPublico(u: any) {
    const { hashClave, ...resto } = u;
    return resto;
  }
}
