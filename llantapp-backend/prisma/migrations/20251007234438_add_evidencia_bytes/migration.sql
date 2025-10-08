-- AlterTable
ALTER TABLE "CitaMantenimiento" ADD COLUMN     "evidenciaBytes" BYTEA,
ADD COLUMN     "evidenciaMime" TEXT,
ADD COLUMN     "evidenciaNombre" TEXT,
ADD COLUMN     "fechaMantenimiento" TIMESTAMP(3);
