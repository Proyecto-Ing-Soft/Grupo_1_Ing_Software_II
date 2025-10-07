/*
  Warnings:

  - You are about to drop the column `tipo` on the `Notificacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notificacion" DROP COLUMN "tipo";

-- DropEnum
DROP TYPE "TipoNotificacion";
