import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import type { Usuario, Rol as PrismaRol } from '@prisma/client';
import { Rol as AppRol } from '../../../common/enums/rol.enum';

// Helper de conversión (mismo literal -> cast seguro)
const toPrismaRol = (r: AppRol): PrismaRol => r as unknown as PrismaRol;

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async crear(datos: {
    nombreCompleto: string;
    correo: string;
    hashClave: string;
    rol?: AppRol;
  }): Promise<Usuario> {
    const rol = toPrismaRol(datos.rol ?? AppRol.CHOFER);
    return this.prisma.usuario.create({
      data: { ...datos, rol },
    });
  }

  async buscarPorCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  async buscarPorId(id: number) {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  async listarPorRol(rol: AppRol) {
    return this.prisma.usuario.findMany({
      where: { rol: toPrismaRol(rol) },
      select: { id: true, nombreCompleto: true },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  aPublico(u: Usuario) {
    const { hashClave, ...resto } = u;
    return resto;
  }
}
