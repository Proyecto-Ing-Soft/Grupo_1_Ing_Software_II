import React, { useEffect, useState } from "react";
import { apiCitas, Tipo } from "./api";
import { useAuth } from "../../core/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./mantenimientosVencidos.css";

type CitaVencida = {
  id: number;
  tipo: Tipo;
  estado: string;
  comentario: string | null;
  programadaPara: string | null;
  vehiculo?: { placa: string | null } | null;
  placaPreliminar?: string | null;
  marcaPreliminar?: string | null;
  modeloPreliminar?: string | null;
  cliente?: { id: number; nombreCompleto: string } | null;
  mecanicoId?: number | null;
  mecanico?: { id: number; nombreCompleto: string } | null;
};

export default function MantenimientosVencidosPagina() {
  const { tieneRol } = useAuth();
  const navigate = useNavigate();

  const [citas, setCitas] = useState<CitaVencida[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard sencillo por si se entra directo
  useEffect(() => {
    if (!tieneRol(["ADMIN"])) {
      navigate("/inicio", { replace: true });
    }
  }, [tieneRol, navigate]);

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await apiCitas.vencidasAdmin();
        setCitas(data as CitaVencida[]);
      } catch (e: any) {
        console.error("[VENCIDAS] Error cargando citas vencidas", e);
        setError(
          e?.message || "No se pudieron cargar los mantenimientos vencidos.",
        );
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const hoy = new Date();

  return (
    <main className="page mant-vencidos">
      <header className="page__header">
        <div className="page__headerMain">
          <h1 className="page__title">Mantenimientos vencidos</h1>
          <p className="page__subtitle">
            Se listan las citas cuya fecha programada ya pasó y aún no han sido
            marcadas como terminadas.
          </p>
        </div>

        <div className="page__headerActions">
          <button
            type="button"
            className="mc-btn mc-btn--gradient"
            onClick={() => navigate("/inicio")}
            title="Volver al inicio"
          >
            <span className="mc-icon" aria-hidden>
              ⬅️
            </span>
            <span className="mc-btn__text">Volver al inicio</span>
          </button>
        </div>
      </header>

      {cargando && (
        <p className="mant-vencidos__info">
          Cargando mantenimientos vencidos…
        </p>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {!cargando && !error && citas.length === 0 && (
        <p className="mant-vencidos__info">
          No hay mantenimientos vencidos por el momento 🎉
        </p>
      )}

      {!cargando && !error && citas.length > 0 && (
        <div className="table-wrap">
          <table className="table mant-vencidos__table">
            <thead>
              <tr>
                <th># Cita</th>
                <th>Fecha programada</th>
                <th>Días de atraso</th>
                <th>Vehículo</th>
                <th>Cliente</th>
                <th>Mecánico</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => {
                const fechaProg = c.programadaPara
                  ? new Date(c.programadaPara)
                  : null;

                const diasAtraso =
                  fechaProg && !Number.isNaN(fechaProg.getTime())
                    ? Math.max(
                        0,
                        Math.floor(
                          (hoy.getTime() - fechaProg.getTime()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      )
                    : null;

                const placa =
                  c.vehiculo?.placa ??
                  (c.placaPreliminar
                    ? c.placaPreliminar.toUpperCase()
                    : null);

                const vehiculoLabel =
                  placa || c.marcaPreliminar || c.modeloPreliminar
                    ? `${placa ?? "Sin placa"}${
                        c.marcaPreliminar || c.modeloPreliminar
                          ? ` – ${[c.marcaPreliminar, c.modeloPreliminar]
                              .filter(Boolean)
                              .join(" ")}`
                          : ""
                      }`
                    : "Sin datos";

                const clienteNombre =
                  c.cliente?.nombreCompleto ?? "Sin cliente asignado";
                const mecanicoNombre =
                  c.mecanico?.nombreCompleto ??
                  (c.mecanicoId ? `Mecánico #${c.mecanicoId}` : "Sin asignar");

                return (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>
                      {fechaProg
                        ? fechaProg.toLocaleDateString("es-PE")
                        : "—"}
                    </td>
                    <td className="mant-vencidos__dias">
                      {diasAtraso != null ? `${diasAtraso} día(s)` : "—"}
                    </td>
                    <td>{vehiculoLabel}</td>
                    <td>{clienteNombre}</td>
                    <td>{mecanicoNombre}</td>
                    <td className="mant-vencidos__estado">{c.estado}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
