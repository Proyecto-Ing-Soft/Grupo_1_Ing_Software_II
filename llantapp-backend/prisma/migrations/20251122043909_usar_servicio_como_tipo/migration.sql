/*
  Warnings:

  - You are about to drop the column `tipo` on the `CitaMantenimiento` table. All the data in the column will be lost.
  - Made the column `servicioId` on table `CitaMantenimiento` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."CitaMantenimiento" DROP CONSTRAINT "CitaMantenimiento_servicioId_fkey";

-- AlterTable
ALTER TABLE "CitaMantenimiento" DROP COLUMN "tipo",
ALTER COLUMN "servicioId" SET NOT NULL;

-- DropEnum
DROP TYPE "public"."TipoMantenimiento";

-- AddForeignKey
ALTER TABLE "CitaMantenimiento" ADD CONSTRAINT "CitaMantenimiento_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
