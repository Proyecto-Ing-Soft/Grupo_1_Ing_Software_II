/*
  Warnings:

  - You are about to drop the column `choferId` on the `Vehiculo` table. All the data in the column will be lost.
  - Added the required column `propietarioUsuarioId` to the `Vehiculo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vehiculo" DROP CONSTRAINT "Vehiculo_choferId_fkey";

-- DropIndex
DROP INDEX "Vehiculo_choferId_idx";

-- AlterTable
ALTER TABLE "Vehiculo" DROP COLUMN "choferId",
ADD COLUMN     "propietarioUsuarioId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_propietarioUsuarioId_fkey" FOREIGN KEY ("propietarioUsuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
