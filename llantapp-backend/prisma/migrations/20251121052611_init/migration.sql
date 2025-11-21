/*
  Warnings:

  - You are about to drop the `AccionUsuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AccionUsuario" DROP CONSTRAINT "AccionUsuario_citaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AccionUsuario" DROP CONSTRAINT "AccionUsuario_usuarioId_fkey";

-- AlterTable
ALTER TABLE "ServicioMecanico" ALTER COLUMN "actualizadoEn" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."AccionUsuario";
