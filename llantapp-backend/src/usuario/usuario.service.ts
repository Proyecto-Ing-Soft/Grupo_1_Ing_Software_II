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
      data: { ...datos, rol: datos.rol ?? Rol.ASISTENTE },
    });
  }

  async buscarPorCorreo(correo: string) {
    return this.prisma.usuario.findUnique({ where: { correo } });
  }

  async buscarPorId(id: number) {
  return this.prisma.usuario.findUnique({ where: { id } });
  }

  aPublico(u: Usuario) {
    // DRY: un solo mapeo a "vista pública".
    const { hashClave, ...resto } = u;
    return resto;
  }
}
