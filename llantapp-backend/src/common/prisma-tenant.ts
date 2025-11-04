// Helper para ejecutar lógica dentro de un esquema tenant (taller_{slug}) + app + public.
// Usa SET LOCAL search_path dentro de una transacción para no afectar otras requests.

import { PrismaClient } from '@prisma/client';

function assertSafeSlug(slug: string) {
  // Permitimos minúsculas, números y guion bajo. Evita inyección en el search_path.
  if (!/^[a-z0-9_]+$/.test(slug)) throw new Error('Slug inválido');
}

export async function withTenant<T>(
  prisma: PrismaClient,
  slug: string,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  assertSafeSlug(slug);
  const schema = `taller_${slug}`;

  return prisma.$transaction(async (tx: { $executeRawUnsafe: (arg0: string) => any; }) => {
    // SET LOCAL aplica solo dentro de esta transacción.
    // NOTA: No hay binding para identificadores → validamos slug y usamos comillas dobles.
    await tx.$executeRawUnsafe(`SET LOCAL search_path = "${schema}", app, public`);
    return fn(tx);
  });
}
