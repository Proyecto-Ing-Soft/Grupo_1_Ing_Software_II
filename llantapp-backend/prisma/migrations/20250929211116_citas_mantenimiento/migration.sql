/*
  Warnings:

  - Added the required column `marcaPreliminar` to the `CitaMantenimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeloPreliminar` to the `CitaMantenimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placaPreliminar` to the `CitaMantenimiento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CitaMantenimiento" DROP CONSTRAINT "CitaMantenimiento_vehiculoId_fkey";

-- AlterTable
ALTER TABLE "CitaMantenimiento" ADD COLUMN     "anioPreliminar" INTEGER,
ADD COLUMN     "colorPreliminar" TEXT,
ADD COLUMN     "marcaPreliminar" TEXT NOT NULL,
ADD COLUMN     "modeloPreliminar" TEXT NOT NULL,
ADD COLUMN     "placaPreliminar" TEXT NOT NULL,
ADD COLUMN     "vinPreliminar" TEXT,
ALTER COLUMN "vehiculoId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CitaMantenimiento_placaPreliminar_idx" ON "CitaMantenimiento"("placaPreliminar");

-- AddForeignKey
ALTER TABLE "CitaMantenimiento" ADD CONSTRAINT "CitaMantenimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
