import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Encriptador } from '../autenticacion/encriptador';
import { withTenant } from '../../common/prisma-tenant';

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

  // Obtiene un rol por su código desde la tabla app.rol usando el mismo tx del tenant.
  private async getRolPorCodigo(tx: any, codigo: string): Promise<any> {
    const cod = (codigo ?? '').trim();
    if (!cod) {
      throw new BadRequestException('Rol no especificado');
    }

    const rol = await tx.rol.findUnique({
      where: { codigo: cod },
    });

    if (!rol) {
      throw new BadRequestException(
        `Rol no configurado en la base de datos: ${cod}`,
      );
    }

    return rol;
  }

  // Crear usuario a partir de datos ya validados por AuthService en un taller concreto.
  async crear(
    slugTaller: string,
    datos: {
      nombreCompleto: string;
      correo: string;
      hashClave: string;
      rol?: string;
    },
  ): Promise<UsuarioDominio> {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const email = datos.correo.trim().toLowerCase();

      const existente = await tx.usuario.findUnique({
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
        rol = await this.getRolPorCodigo(tx, datos.rol);
      }

      const usuario = await tx.usuario.create({
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
    });
  }

  // Buscar usuario por correo (para login) en un taller concreto.
  async buscarPorCorreo(
    slugTaller: string,
    correo: string,
  ): Promise<UsuarioDominio | null> {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const email = correo.trim().toLowerCase();

      const usuario = await tx.usuario.findUnique({
        where: { email },
        include: {
          roles: { include: { rol: true } },
        },
      });

      if (!usuario) return null;

      return this.mapUsuarioConRoles(usuario);
    });
  }

  // Buscar usuario por id (para perfil, refresh, etc.) en un taller concreto.
  async buscarPorId(
    slugTaller: string,
    id: number,
  ): Promise<UsuarioDominio | null> {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const usuario = await tx.usuario.findUnique({
        where: { id },
        include: {
          roles: { include: { rol: true } },
        },
      });

      if (!usuario) return null;

      return this.mapUsuarioConRoles(usuario);
    });
  }

  // Listar usuarios por código de rol (rol.codigo en BD) en un taller concreto.
  async listarPorRol(slugTaller: string, rolCodigo: string) {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const rol = await this.getRolPorCodigo(tx, rolCodigo);

      const usuarios = await tx.usuario.findMany({
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
    });
  }

  // Listar usuarios por varios códigos de rol en un taller concreto.
  async listarPorRoles(slugTaller: string, rolesCodigo: string[]) {
    if (!rolesCodigo || rolesCodigo.length === 0) {
      return [];
    }

    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const roles = await tx.rol.findMany({
        where: { codigo: { in: rolesCodigo } },
      });
      if (!roles.length) return [];

      const rolIds = roles.map((r: any) => r.id);

      const usuarios = await tx.usuario.findMany({
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
    });
  }

  // Personal del taller: usuarios con rol ADMIN_TALLER o MECANICO.
  // (Los códigos vienen de la tabla rol; aquí no usamos enums locales.)
  async listarTaller(slugTaller: string) {
    return this.listarPorRoles(slugTaller, ['ADMIN_TALLER', 'MECANICO']);
  }

  // Crear personal del taller recibiendo clave en texto plano.
  // El rol se valida siempre contra la BD.
  async crearPersonalTaller(input: {
    slugTaller: string;
    nombreCompleto: string;
    correo: string;
    clave: string;
    rolCodigo: string;
  }) {
    const hashClave = await this.enc.hashear(input.clave);

    const usuario = await this.crear(input.slugTaller, {
      nombreCompleto: input.nombreCompleto,
      correo: input.correo,
      hashClave,
      rol: input.rolCodigo,
    });

    return this.aPublico(usuario);
  }

  // Actualizar datos/rol de personal de taller (solo si tiene rol de taller).
  async actualizarPersonalTaller(
    slugTaller: string,
    id: number,
    dto: { nombreCompleto?: string; correo?: string; rol?: string },
  ) {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const usuario = await tx.usuario.findUnique({
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
        const dupe = await tx.usuario.findUnique({
          where: { email },
        });
        if (dupe && dupe.id !== usuario.id) {
          throw new ConflictException('El correo ya está registrado');
        }
        data.email = email;
      }

      if (dto.rol) {
        const rol = await this.getRolPorCodigo(tx, dto.rol);

        await tx.usuarioRol.deleteMany({
          where: { usuarioId: usuario.id },
        });

        data.roles = {
          create: [{ rol: { connect: { id: rol.id } } }],
        };
      }

      const actualizado = await tx.usuario.update({
        where: { id },
        data,
        include: { roles: { include: { rol: true } } },
      });

      return this.aPublico(this.mapUsuarioConRoles(actualizado));
    });
  }

  // Eliminar personal de taller (solo si su rol es de taller).
  async eliminarPersonalTaller(slugTaller: string, id: number) {
    return withTenant(this.prisma, slugTaller, async (tx: any) => {
      const usuario = await tx.usuario.findUnique({
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

      await tx.usuarioRol.deleteMany({
        where: { usuarioId: usuario.id },
      });

      await tx.usuario.delete({ where: { id } });

      return { ok: true };
    });
  }

  // Proyección pública (sin hash).
  aPublico(u: UsuarioDominio) {
    const { hashClave, ...resto } = u;
    return resto;
  }
}
