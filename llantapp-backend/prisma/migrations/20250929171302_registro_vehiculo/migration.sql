/*
  Warnings:

  - The values [ACEPTADA] on the enum `EstadoCita` will be removed. If these variants are still used in the database, this will fail.
  - The values [ASISTENTE] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `prioridad` on the `Notificacion` table. All the data in the column will be lost.
  - You are about to drop the column `kms` on the `Vehiculo` table. All the data in the column will be lost.
  - You are about to drop the column `proximoMantenimientoFecha` on the `Vehiculo` table. All the data in the column will be lost.
  - You are about to drop the column `proximoMantenimientoKm` on the `Vehiculo` table. All the data in the column will be lost.
  - You are about to drop the `Llanta` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoCita_new" AS ENUM ('SOLICITADA', 'EN_PROGRESO', 'TERMINADA');
ALTER TABLE "CitaMantenimiento" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "CitaMantenimiento" ALTER COLUMN "estado" TYPE "EstadoCita_new" USING ("estado"::text::"EstadoCita_new");
ALTER TYPE "EstadoCita" RENAME TO "EstadoCita_old";
ALTER TYPE "EstadoCita_new" RENAME TO "EstadoCita";
DROP TYPE "EstadoCita_old";
ALTER TABLE "CitaMantenimiento" ALTER COLUMN "estado" SET DEFAULT 'SOLICITADA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('ADMIN', 'MECANICO', 'CHOFER', 'EMPRESA');
ALTER TABLE "Usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "Rol_old";
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CHOFER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Llanta" DROP CONSTRAINT "Llanta_vehiculoId_fkey";

-- AlterTable
ALTER TABLE "Notificacion" DROP COLUMN "prioridad";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "rol" SET DEFAULT 'CHOFER';

-- AlterTable
ALTER TABLE "Vehiculo" DROP COLUMN "kms",
DROP COLUMN "proximoMantenimientoFecha",
DROP COLUMN "proximoMantenimientoKm";

-- DropTable
DROP TABLE "Llanta";

-- DropEnum
DROP TYPE "PrioridadNotificacion";
