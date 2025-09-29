/*
  Warnings:

  - Added the required column `tipo` to the `Notificacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'LEGAL_ITV', 'EXTRAS');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('SOLICITADA', 'ACEPTADA', 'EN_PROGRESO', 'TERMINADA');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('CITA', 'SISTEMA', 'LLANTA');

-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN     "citaId" INTEGER,
ADD COLUMN     "tipo" "TipoNotificacion" NOT NULL;

-- CreateTable
CREATE TABLE "CitaMantenimiento" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMantenimiento" NOT NULL,
    "comentario" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'SOLICITADA',
    "programadaPara" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "mecanicoId" INTEGER,
    "vehiculoId" INTEGER NOT NULL,

    CONSTRAINT "CitaMantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CitaMantenimiento_clienteId_idx" ON "CitaMantenimiento"("clienteId");

-- CreateIndex
CREATE INDEX "CitaMantenimiento_mecanicoId_estado_idx" ON "CitaMantenimiento"("mecanicoId", "estado");

-- CreateIndex
CREATE INDEX "CitaMantenimiento_vehiculoId_idx" ON "CitaMantenimiento"("vehiculoId");

-- CreateIndex
CREATE INDEX "Notificacion_citaId_idx" ON "Notificacion"("citaId");

-- AddForeignKey
ALTER TABLE "CitaMantenimiento" ADD CONSTRAINT "CitaMantenimiento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaMantenimiento" ADD CONSTRAINT "CitaMantenimiento_mecanicoId_fkey" FOREIGN KEY ("mecanicoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaMantenimiento" ADD CONSTRAINT "CitaMantenimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "CitaMantenimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
