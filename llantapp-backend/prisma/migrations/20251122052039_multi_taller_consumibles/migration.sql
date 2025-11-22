/*
  Warnings:

  - A unique constraint covering the columns `[tallerId,nombre]` on the table `Consumible` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tallerId` to the `Consumible` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Consumible_nombre_key";

-- AlterTable
ALTER TABLE "Consumible" ADD COLUMN     "tallerId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Consumible_tallerId_idx" ON "Consumible"("tallerId");

-- CreateIndex
CREATE UNIQUE INDEX "Consumible_tallerId_nombre_key" ON "Consumible"("tallerId", "nombre");

-- AddForeignKey
ALTER TABLE "Consumible" ADD CONSTRAINT "Consumible_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "Taller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
