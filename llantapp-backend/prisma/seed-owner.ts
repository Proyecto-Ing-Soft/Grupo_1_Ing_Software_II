// prisma/seed-owner.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const correo = 'owner@gmail.com';

  // 1) Verificar si ya existe
  const existente = await prisma.usuario.findUnique({ where: { correo } });
  if (existente) {
    console.log('✅ El usuario OWNER ya existe con id =', existente.id);
    return;
  }

  // 2) Hashear contraseña "owner123"
  const hashClave = await bcrypt.hash('owner123', 10);

  // 3) Crear usuario OWNER
  const creado = await prisma.usuario.create({
    data: {
      nombreCompleto: 'OWNER LLANTAPP',
      correo,
      hashClave,
      rol: 'OWNER', // enum Rol en Prisma
      // tallerId: null, // si quieres dejarlo sin taller
    },
  });

  console.log('🎉 Usuario OWNER creado:', creado);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
