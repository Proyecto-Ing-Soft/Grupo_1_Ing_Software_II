// usuario.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario, Rol } from '@prisma/client';

// SRP: Acceso y lógica de dominio para usuarios.
// DRY: métodos reutilizables para otros casos de uso.
@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: { nombreCompleto: string; correo: string; hashClave: string; rol?: Rol }): Promise<Usuario> {
    return this.prisma.usuario.create({
      data: { ...datos, rol: datos.rol ?? Rol.CHOFER },
    });
  }

  async buscarPorCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  async buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  // ✅ Nuevo caso de uso: listar por rol (ej. MECANICO) para que el cliente elija a quién agendar
  async listarPorRol(rol: string) {
    // KISS: casteamos al enum de Prisma; si el rol no existe, simplemente devolverá []
    return this.prisma.usuario.findMany({
      where: { rol: rol as Rol },
      select: { id: true, nombreCompleto: true },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  aPublico(u: Usuario) {
    // DRY: un solo mapeo a "vista pública".
    const { hashClave, ...resto } = u;
    return resto;
  }
}
