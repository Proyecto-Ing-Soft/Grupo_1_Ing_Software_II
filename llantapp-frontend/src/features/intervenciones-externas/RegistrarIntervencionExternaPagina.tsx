import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  apiIntervencionesExternas,
  IntervencionExternaDTO,
  CrearIntervencionExternaPayload,
} from "./api";
import "../mantenimientos/miscitas.css"; // reusa estilos base de tarjetas
import "./intervencionesExternas.css";

type FormState = {
  fecha: string;
  kilometraje: string;
  descripcion: string;
  tallerNombre: string;
  costoAproximado: string;
};

export default function RegistrarIntervencionExternaPagina() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const vehiculoId = Number(id);
  const [form, setForm] = useState<FormState>({
    fecha: "",
    kilometraje: "",
    descripcion: "",
    tallerNombre: "",
    costoAproximado: "",
  });

  const [intervenciones, setIntervenciones] = useState<IntervencionExternaDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Cargar historial inicial
  useEffect(() => {
    if (!vehiculoId || Number.isNaN(vehiculoId)) {
      setErr("Vehículo no válido");
      setCargando(false);
      return;
    }

    (async () => {
      try {
        setCargando(true);
        const data = await apiIntervencionesExternas.listarPorVehiculo(vehiculoId);
        setIntervenciones(data ?? []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || "Error cargando intervenciones externas");
      } finally {
        setCargando(false);
      }
    })();
  }, [vehiculoId]);

  // Animación simple (reaprovechando clases .reveal de miscitas.css)
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-interv")
    );
    const t = window.setTimeout(
      () => nodes.forEach((n) => n.classList.add("will-animate")),
      0
    );

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.classList.add("animate-in");
          else el.classList.remove("animate-in");
        }
      },
      { threshold: 0.12 }
    );

    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });

    return () => {
      window.clearTimeout(t);
      nodes.forEach((n) => obs.unobserve(n));
      obs.disconnect();
    };
  }, [cargando, intervenciones.length]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoId || Number.isNaN(vehiculoId)) {
      setErr("Vehículo no válido");
      return;
    }

    if (!form.fecha || !form.descripcion.trim()) {
      setErr("Completa al menos fecha y descripción");
      return;
    }

    const payload: CrearIntervencionExternaPayload = {
      vehiculoId,
      fecha: form.fecha,
      descripcion: form.descripcion.trim(),
    };

    if (form.kilometraje) {
      const km = Number(form.kilometraje);
      if (!Number.isNaN(km) && km >= 0) payload.kilometraje = km;
    }

    if (form.tallerNombre.trim()) {
      payload.tallerNombre = form.tallerNombre.trim();
    }

    if (form.costoAproximado) {
      const costo = Number(form.costoAproximado);
      if (!Number.isNaN(costo) && costo >= 0) payload.costoAproximado = costo;
    }

    try {
      setErr(null);
      setOkMsg(null);
      const nueva = await apiIntervencionesExternas.crear(payload);
      setIntervenciones((prev) => [nueva, ...prev]);
      setOkMsg("Intervención registrada correctamente.");
      // reset parcial (dejamos fecha por si quiere registrar varias del mismo día)
      setForm((prev) => ({
        ...prev,
        kilometraje: "",
        descripcion: "",
        tallerNombre: "",
        costoAproximado: "",
      }));
    } catch (e: any) {
      setErr(e?.message || "Error registrando la intervención");
    }
  };

  const fmtFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-PE", { dateStyle: "medium" });

  const fmtMoneda = (valor: string | null) => {
    if (!valor) return "—";
    const num = Number(valor);
    if (Number.isNaN(num)) return valor;
    return num.toLocaleString("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    });
  };

  return (
    <main className="iex">
      <header className="iex__header reveal-interv" data-reveal="1">
        <div className="iex__titleWrap">
          <h1 className="iex__title">Intervenciones externas</h1>
          <p className="iex__sub">
            Registra trabajos realizados fuera del taller para mantener el historial de tu vehículo al día.
          </p>
        </div>

        <div className="iex__toolbar">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mc-btn mc-btn--gradient"
          >
            <span className="mc-icon" aria-hidden>
              ⬅️
            </span>
            <span className="mc-btn__text">Volver</span>
          </button>
          <Link
            to={`/vehiculos/${vehiculoId}/historial`}
            className="iex__linkHistorial"
          >
            Ver historial de mantenimientos
          </Link>
        </div>
      </header>

      {/* Mensajes de estado */}
      {err && (
        <div
          className="iex__alert iex__alert--error reveal-interv"
          data-reveal="2"
        >
          {err}
        </div>
      )}
      {okMsg && (
        <div
          className="iex__alert iex__alert--ok reveal-interv"
          data-reveal="2"
        >
          {okMsg}
        </div>
      )}

      {/* Formulario */}
      <section className="iex__section reveal-interv" data-reveal="3">
        <h2 className="iex__sectionTitle">Registrar intervención externa</h2>
        <form className="iex__form" onSubmit={handleSubmit}>
          <div className="iex__grid">
            <div className="iex__field">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
                required
              />
            </div>

            <div className="iex__field">
              <label htmlFor="km">Kilometraje (opcional)</label>
              <input
                id="km"
                type="number"
                min={0}
                placeholder="Ej. 45000"
                value={form.kilometraje}
                onChange={(e) => handleChange("kilometraje", e.target.value)}
              />
            </div>

            <div className="iex__field">
              <label htmlFor="taller">Taller o proveedor (opcional)</label>
              <input
                id="taller"
                type="text"
                maxLength={255}
                placeholder="Ej. Taller Juanito, concesionario, etc."
                value={form.tallerNombre}
                onChange={(e) => handleChange("tallerNombre", e.target.value)}
              />
            </div>

            <div className="iex__field">
              <label htmlFor="costo">Costo aprox. (S/)</label>
              <input
                id="costo"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej. 250.00"
                value={form.costoAproximado}
                onChange={(e) =>
                  handleChange("costoAproximado", e.target.value)
                }
              />
            </div>
          </div>

          <div className="iex__field iex__field--full">
            <label htmlFor="desc">Descripción de los trabajos realizados</label>
            <textarea
              id="desc"
              rows={4}
              maxLength={2000}
              placeholder="Ej. Cambio de aceite, alineación y balanceo, cambio de pastillas de freno, etc."
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              required
            />
          </div>

          <div className="iex__actions">
            <button type="submit" className="mc-btn mc-btn--gradient">
              <span className="mc-icon" aria-hidden>
                ➕
              </span>
              <span className="mc-btn__text">Guardar intervención</span>
            </button>
          </div>
        </form>
      </section>

      {/* Historial */}
      <section className="iex__section reveal-interv" data-reveal="4">
        <h2 className="iex__sectionTitle">Historial de intervenciones externas</h2>

        {cargando && (
          <div className="iex__hint" role="status">
            Cargando historial…
          </div>
        )}

        {!cargando && intervenciones.length === 0 && (
          <div className="iex__empty">
            <div className="iex__emptyEmoji" aria-hidden>
              📭
            </div>
            <div className="iex__emptyTitle">Sin intervenciones externas</div>
            <div className="iex__emptySub">
              Cuando registres trabajos realizados fuera del taller, aparecerán aquí.
            </div>
          </div>
        )}

        {!cargando && intervenciones.length > 0 && (
          <div className="iex__tableWrap">
            <table className="iex__table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Kilometraje</th>
                  <th>Taller / proveedor</th>
                  <th>Costo aprox.</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {intervenciones.map((it) => (
                  <tr key={it.id}>
                    <td>{fmtFecha(it.fecha)}</td>
                    <td>{it.kilometraje ?? "—"}</td>
                    <td>{it.tallerNombre || "—"}</td>
                    <td>{fmtMoneda(it.costoAproximado)}</td>
                    <td>{it.descripcion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
