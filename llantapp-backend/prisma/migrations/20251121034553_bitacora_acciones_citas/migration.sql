-- AlterTable
ALTER TABLE "ServicioMecanico" ALTER COLUMN "actualizadoEn" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AccionUsuario" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "citaId" INTEGER,
    "mecanicoId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccionUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccionUsuario_usuarioId_creadoEn_idx" ON "AccionUsuario"("usuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "AccionUsuario_tipo_creadoEn_idx" ON "AccionUsuario"("tipo", "creadoEn");

-- CreateIndex
CREATE INDEX "AccionUsuario_citaId_idx" ON "AccionUsuario"("citaId");

-- AddForeignKey
ALTER TABLE "AccionUsuario" ADD CONSTRAINT "AccionUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccionUsuario" ADD CONSTRAINT "AccionUsuario_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "CitaMantenimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
