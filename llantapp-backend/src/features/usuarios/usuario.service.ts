import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Encriptador } from '../autenticacion/encriptador';

// SRP: adapta las entidades de BD (usuario, usuario_rol, rol)
// al modelo de usuario usado por autenticación y controladores.
type UsuarioDominio = {
  id: number;
  nombreCompleto: string;
  correo: string;
  hashClave: string;
  rol: string;
  creadoEn?: Date;
};

@Injectable()
export class UsuarioService {
  private readonly enc = new Encriptador();

  constructor(private readonly prisma: PrismaService) {}

  // Traduce usuario+roles de Prisma al contrato usado por el resto de la app.
  private mapUsuarioConRoles(raw: any): UsuarioDominio {
    if (!raw) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const id = Number(raw.id ?? raw.usuarioId);

    const correo =
      (raw.correo ?? raw.email ?? '').toString().toLowerCase();

    const nombres = (raw.nombres ?? '').toString().trim();
    const apellidos = (raw.apellidos ?? '').toString().trim();

    const nombreCompleto =
      (raw.nombreCompleto as string | undefined)?.trim() ||
      [nombres, apellidos].filter(Boolean).join(' ');

    let rolCodigo = '';
    if (typeof raw.rol === 'string') {
      rolCodigo = raw.rol;
    } else if (Array.isArray(raw.roles) && raw.roles.length > 0) {
      // Tomamos el primer rol asociado como principal.
      rolCodigo = raw.roles[0]?.rol?.codigo ?? '';
    }

    const hashClave =
      raw.hashClave ??
      raw.passwordHash ??
      raw.password_hash ??
      '';

    const creadoEn =
      raw.creadoEn ??
      raw.fechaCreacion ??
      raw.fecha_creacion ??
      raw.fechaAlta ??
      raw.fecha_alta;

    return {
      id,
      nombreCompleto,
      correo,
      hashClave,
      rol: rolCodigo,
      creadoEn,
    };
  }

  // Obtiene un rol por su código desde la tabla app.rol
  private async getRolPorCodigo(codigo: string): Promise<any> {
    const cod = (codigo ?? '').trim();
    if (!cod) {
      throw new BadRequestException('Rol no especificado');
    }

    const rol = await (this.prisma as any).rol.findUnique({
      where: { codigo: cod },
    });

    if (!rol) {
      throw new BadRequestException(
        `Rol no configurado en la base de datos: ${cod}`,
      );
    }

    return rol;
  }

  // Crear usuario a partir de datos ya validados por AuthService.
  async crear(datos: {
    nombreCompleto: string;
    correo: string;
    hashClave: string;
    rol?: string;
  }): Promise<UsuarioDominio> {
    const email = datos.correo.trim().toLowerCase();

    const existente = await (this.prisma as any).usuario.findUnique({
      where: { email },
    });
    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const [nombres, ...resto] = datos.nombreCompleto
      .trim()
      .split(/\s+/);
    const apellidos = resto.join(' ') || nombres;

    let rol: any | null = null;
    if (datos.rol) {
      rol = await this.getRolPorCodigo(datos.rol);
    }

    const usuario = await (this.prisma as any).usuario.create({
      data: {
        nombres,
        apellidos,
        email,
        passwordHash: datos.hashClave,
        // Estado activo por defecto (configurado en usuario_estado)
        usuarioEstado: {
          connect: { codigo: 'activo' },
        },
        ...(rol && {
          roles: {
            create: [
              {
                rol: { connect: { id: rol.id } },
              },
            ],
          },
        }),
      },
      include: {
        roles: { include: { rol: true } },
      },
    });

    return this.mapUsuarioConRoles(usuario);
  }

  // Buscar usuario por correo (para login).
  async buscarPorCorreo(correo: string): Promise<UsuarioDominio | null> {
    const email = correo.trim().toLowerCase();

    const usuario = await (this.prisma as any).usuario.findUnique({
      where: { email },
      include: {
        roles: { include: { rol: true } },
      },
    });

    if (!usuario) return null;

    return this.mapUsuarioConRoles(usuario);
  }

  // Buscar usuario por id (para perfil, refresh, etc.).
  async buscarPorId(id: number): Promise<UsuarioDominio | null> {
    const usuario = await (this.prisma as any).usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
      },
    });

    if (!usuario) return null;

    return this.mapUsuarioConRoles(usuario);
  }

  // Listar usuarios por código de rol (rol.codigo en BD).
  async listarPorRol(rolCodigo: string) {
    const rol = await this.getRolPorCodigo(rolCodigo);

    const usuarios = await (this.prisma as any).usuario.findMany({
      where: {
        roles: {
          some: { rolId: rol.id },
        },
      },
      include: {
        roles: { include: { rol: true } },
      },
      orderBy: { nombres: 'asc' },
    });

    return usuarios.map((u: any) =>
      this.aPublico(this.mapUsuarioConRoles(u)),
    );
  }

  // Listar usuarios por varios códigos de rol.
  async listarPorRoles(rolesCodigo: string[]) {
    if (!rolesCodigo || rolesCodigo.length === 0) {
      return [];
    }

    const roles = await (this.prisma as any).rol.findMany({
      where: { codigo: { in: rolesCodigo } },
    });
    if (!roles.length) return [];

    const rolIds = roles.map((r: any) => r.id);

    const usuarios = await (this.prisma as any).usuario.findMany({
      where: {
        roles: {
          some: { rolId: { in: rolIds } },
        },
      },
      include: {
        roles: { include: { rol: true } },
      },
      orderBy: { nombres: 'asc' },
    });

    return usuarios.map((u: any) =>
      this.aPublico(this.mapUsuarioConRoles(u)),
    );
  }

  // Personal del taller: usuarios con rol ADMIN_TALLER o MECANICO.
  // (Los códigos vienen de la tabla rol; aquí no usamos enums locales.)
  async listarTaller() {
    const roles = await (this.prisma as any).rol.findMany({
      where: { codigo: { in: ['ADMIN_TALLER', 'MECANICO'] } },
    });

    if (!roles.length) return [];

    const rolIds = roles.map((r: any) => r.id);

    const usuarios = await (this.prisma as any).usuario.findMany({
      where: {
        roles: {
          some: { rolId: { in: rolIds } },
        },
      },
      include: {
        roles: { include: { rol: true } },
      },
      orderBy: { nombres: 'asc' },
    });

    return usuarios.map((u: any) =>
      this.aPublico(this.mapUsuarioConRoles(u)),
    );
  }

  // Crear personal del taller recibiendo clave en texto plano.
  // El rol se valida siempre contra la BD.
  async crearPersonalTaller(input: {
    nombreCompleto: string;
    correo: string;
    clave: string;
    rolCodigo: string;
  }) {
    const hashClave = await this.enc.hashear(input.clave);

    const usuario = await this.crear({
      nombreCompleto: input.nombreCompleto,
      correo: input.correo,
      hashClave,
      rol: input.rolCodigo,
    });

    return this.aPublico(usuario);
  }

  // Actualizar datos/rol de personal de taller (solo si tiene rol de taller).
  async actualizarPersonalTaller(
    id: number,
    dto: { nombreCompleto?: string; correo?: string; rol?: string },
  ) {
    const usuario = await (this.prisma as any).usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
      },
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const codigosActuales = (usuario.roles ?? []).map(
      (r: any) => r.rol?.codigo,
    );

    if (
      !codigosActuales.includes('ADMIN_TALLER') &&
      !codigosActuales.includes('MECANICO')
    ) {
      throw new BadRequestException(
        'Solo se puede actualizar personal de taller',
      );
    }

    const data: any = {};

    if (dto.nombreCompleto) {
      const [nombres, ...resto] = dto.nombreCompleto
        .trim()
        .split(/\s+/);
      data.nombres = nombres;
      data.apellidos = resto.join(' ') || usuario.apellidos;
    }

    if (dto.correo) {
      const email = dto.correo.trim().toLowerCase();
      const dupe = await (this.prisma as any).usuario.findUnique({
        where: { email },
      });
      if (dupe && dupe.id !== usuario.id) {
        throw new ConflictException('El correo ya está registrado');
      }
      data.email = email;
    }

    if (dto.rol) {
      const rol = await this.getRolPorCodigo(dto.rol);

      await (this.prisma as any).usuarioRol.deleteMany({
        where: { usuarioId: usuario.id },
      });

      data.roles = {
        create: [{ rol: { connect: { id: rol.id } } }],
      };
    }

    const actualizado = await (this.prisma as any).usuario.update({
      where: { id },
      data,
      include: { roles: { include: { rol: true } } },
    });

    return this.aPublico(this.mapUsuarioConRoles(actualizado));
  }

  // Eliminar personal de taller (solo si su rol es de taller).
  async eliminarPersonalTaller(id: number) {
    const usuario = await (this.prisma as any).usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const codigos = (usuario.roles ?? []).map(
      (r: any) => r.rol?.codigo,
    );

    if (
      !codigos.includes('ADMIN_TALLER') &&
      !codigos.includes('MECANICO')
    ) {
      throw new BadRequestException(
        'Solo se puede eliminar personal de taller',
      );
    }

    await (this.prisma as any).usuarioRol.deleteMany({
      where: { usuarioId: usuario.id },
    });

    await (this.prisma as any).usuario.delete({ where: { id } });

    return { ok: true };
  }

  // Proyección pública (sin hash).
  aPublico(u: UsuarioDominio) {
    const { hashClave, ...resto } = u;
    return resto;
  }
}
