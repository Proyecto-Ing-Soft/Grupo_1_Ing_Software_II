/*
  Warnings:

  - The values [CONDUCTOR] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('MANTENIMIENTO_KM', 'MANTENIMIENTO_FECHA', 'VENCIMIENTO_LLANTA');

-- CreateEnum
CREATE TYPE "PrioridadNotificacion" AS ENUM ('BAJA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('PENDIENTE', 'LEIDA');

-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'MECANICO', 'ASISTENTE', 'CHOFER', 'EMPRESA');
ALTER TABLE "Usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "Rol_old";
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'ASISTENTE';
COMMIT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "empresaId" INTEGER;

-- AlterTable
ALTER TABLE "Vehiculo" ADD COLUMN     "choferId" INTEGER,
ADD COLUMN     "empresaId" INTEGER,
ADD COLUMN     "kms" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proximoMantenimientoFecha" TIMESTAMP(3),
ADD COLUMN     "proximoMantenimientoKm" INTEGER;

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Llanta" (
    "id" SERIAL NOT NULL,
    "vehiculoId" INTEGER NOT NULL,
    "posicion" TEXT,
    "fechaInstalacion" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "vidaUtilKm" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Llanta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "vehiculoId" INTEGER,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "prioridad" "PrioridadNotificacion" NOT NULL DEFAULT 'MEDIA',
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaLimite" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE INDEX "Llanta_vehiculoId_idx" ON "Llanta"("vehiculoId");

-- CreateIndex
CREATE INDEX "Llanta_fechaVencimiento_idx" ON "Llanta"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "Notificacion_usuarioId_estado_idx" ON "Notificacion"("usuarioId", "estado");

-- CreateIndex
CREATE INDEX "Notificacion_vehiculoId_idx" ON "Notificacion"("vehiculoId");

-- CreateIndex
CREATE INDEX "Vehiculo_choferId_idx" ON "Vehiculo"("choferId");

-- CreateIndex
CREATE INDEX "Vehiculo_empresaId_idx" ON "Vehiculo"("empresaId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_choferId_fkey" FOREIGN KEY ("choferId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Llanta" ADD CONSTRAINT "Llanta_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
