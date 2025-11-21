-- CreateTable
CREATE TABLE "IntervencionExterna" (
    "id" SERIAL NOT NULL,
    "vehiculoId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "kilometraje" INTEGER,
    "descripcion" TEXT NOT NULL,
    "tallerNombre" TEXT,
    "costoAproximado" DECIMAL(10,2),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntervencionExterna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntervencionExterna_vehiculoId_idx" ON "IntervencionExterna"("vehiculoId");

-- CreateIndex
CREATE INDEX "IntervencionExterna_clienteId_fecha_idx" ON "IntervencionExterna"("clienteId", "fecha");

-- AddForeignKey
ALTER TABLE "IntervencionExterna" ADD CONSTRAINT "IntervencionExterna_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntervencionExterna" ADD CONSTRAINT "IntervencionExterna_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
