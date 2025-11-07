// DIP/SRP: encapsula el uso de search_path por esquema tenant (taller_{slug})
// para que los servicios usen Prisma sin acoplarse al detalle multi-tenant.

import { PrismaClient } from '@prisma/client';

function assertSafeSlug(slug: string) {
  if (!/^[a-z0-9_]+$/.test(slug)) {
    throw new Error('Slug inválido');
  }
}

export async function withTenant<T>(
  prisma: PrismaClient,
  slug: string,
  fn: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  assertSafeSlug(slug);
  const schema = `taller_${slug}`;

  return prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path = "${schema}", app, public`,
    );
    return fn(tx as PrismaClient);
  });
}
