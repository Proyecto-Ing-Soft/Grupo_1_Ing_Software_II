-- CreateTable
CREATE TABLE "CalificacionCita" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "estrellas" SMALLINT NOT NULL,
    "comentario" TEXT,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalificacionCita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionCita_citaId_key" ON "CalificacionCita"("citaId");

-- CreateIndex
CREATE INDEX "CalificacionCita_clienteId_idx" ON "CalificacionCita"("clienteId");

-- AddForeignKey
ALTER TABLE "CalificacionCita" ADD CONSTRAINT "CalificacionCita_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "CitaMantenimiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionCita" ADD CONSTRAINT "CalificacionCita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
