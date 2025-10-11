-- CreateTable: Servicio (catálogo)
CREATE TABLE "Servicio" (
  "id" SERIAL NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "precioSugerido" DECIMAL(10,2),
  "duracionMinutos" INTEGER,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- Unicidad de nombre de servicio
CREATE UNIQUE INDEX "Servicio_nombre_key" ON "Servicio"("nombre");

-- CreateTable: ServicioMecanico (relación Servicio <-> Usuario(mecánico))
CREATE TABLE "ServicioMecanico" (
  "servicioId" INTEGER NOT NULL,
  "mecanicoId" INTEGER NOT NULL,
  "habilitado" BOOLEAN NOT NULL DEFAULT TRUE,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "actualizadoEn" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ServicioMecanico_pkey" PRIMARY KEY ("servicioId", "mecanicoId")
);

-- Índice para consultas por mecánico
CREATE INDEX "ServicioMecanico_mecanicoId_idx" ON "ServicioMecanico"("mecanicoId");

-- FK: ServicioMecanico -> Servicio
ALTER TABLE "ServicioMecanico"
ADD CONSTRAINT "ServicioMecanico_servicioId_fkey"
FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: ServicioMecanico -> Usuario (solo mecánicos a nivel de app)
ALTER TABLE "ServicioMecanico"
ADD CONSTRAINT "ServicioMecanico_mecanicoId_fkey"
FOREIGN KEY ("mecanicoId") REFERENCES "Usuario"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: CitaMantenimiento -> agrega servicioId (opcional por compatibilidad)
ALTER TABLE "CitaMantenimiento"
ADD COLUMN "servicioId" INTEGER;

-- Índice para consultas por servicio en citas
CREATE INDEX "CitaMantenimiento_servicioId_idx" ON "CitaMantenimiento"("servicioId");

-- FK: CitaMantenimiento -> Servicio (opcional: SET NULL al borrar)
ALTER TABLE "CitaMantenimiento"
ADD CONSTRAINT "CitaMantenimiento_servicioId_fkey"
FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
