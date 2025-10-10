/*
  Warnings:

  - The values [CLIENTE] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'MECANICO', 'CLIENTE');
ALTER TABLE "Usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "Rol_old";
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CLIENTE';
