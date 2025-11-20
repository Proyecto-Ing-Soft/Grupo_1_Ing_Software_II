import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./intervencionesExternas.css";
import {
  apiIntervencionesExternas,
  parseHttpError,
  type Intervencion,
} from "./api";

type FormState = {
  vehiculoId: string;
  fecha: string;        
  descripcion: string;
  comprobanteUrl: string;
};

function formatFecha(fechaIso: string): string {
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return fechaIso;
  return d.toLocaleString();
}

export default function IntervencionesExternasPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Intervencion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) =>
      x.descripcion.toLowerCase().includes(s) ||
      String(x.vehiculoId).includes(s)
    );
  }, [q, items]);

  const [form, setForm] = useState<FormState>({
    vehiculoId: "",
    fecha: "",
    descripcion: "",
    comprobanteUrl: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await apiIntervencionesExternas.listarMias();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message || "Error al cargar las intervenciones.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".ext .reveal"));
    const t = window.setTimeout(
      () => nodes.forEach((n) => n.classList.add("will-animate")),
      0,
    );
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("animate-in");
          else e.target.classList.remove("animate-in");
        }
      },
      { threshold: 0.12 },
    );
    nodes.forEach((n, i) => {
      (n.dataset as any).reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });
    return () => {
      window.clearTimeout(t);
      nodes.forEach((n) => obs.unobserve(n));
      obs.disconnect();
    };
  }, [filtrados.length]);

  const limpiarForm = () => {
    setForm({
      vehiculoId: "",
      fecha: "",
      descripcion: "",
      comprobanteUrl: "",
    });
  };

  const guardar = async () => {
    setErr(null);
    setOk(null);

    const vehiculoIdNum = Number(form.vehiculoId);
    if (!Number.isFinite(vehiculoIdNum) || vehiculoIdNum <= 0) {
      setErr("Debes indicar un ID de vehículo válido.");
      return;
    }
    if (!form.fecha) {
      setErr("Debes indicar la fecha de la intervención.");
      return;
    }
    const descripcion = form.descripcion.trim();
    if (!descripcion) {
      setErr("La descripción es obligatoria.");
      return;
    }

    const fechaIso = new Date(form.fecha).toISOString();

    try {
      const creada = await apiIntervencionesExternas.crear({
        vehiculoId: vehiculoIdNum,
        fechaIso,
        descripcion,
        comprobanteUrl: form.comprobanteUrl,
      });
      setItems((prev) => [creada, ...prev]);
      setOk("Intervención registrada correctamente.");
      limpiarForm();
    } catch (e: any) {
      setErr(parseHttpError(e?.message || "Error al registrar la intervención."));
    }
  };

  return (
    <main className="ext">
      <header className="ext__header ext__stack-lg">
        <div className="ext__titleWrap reveal" data-reveal="1">
          <h1 className="ext__title">Intervenciones externas</h1>
          <p className="ext__sub">
            Registra cambios realizados fuera del taller y mantén tu historial de vehículo completo.
          </p>
        </div>

        <div className="ext__toolbar reveal" data-reveal="2">
          <div className="ext__actions">
            <button
              type="button"
              className="mc-btn mc-btn--gradient"
              onClick={() => navigate("/inicio")}
            >
              <span aria-hidden>⬅️</span>
              <span>Volver al inicio</span>
            </button>
          </div>
        </div>
      </header>

      <section className="ext__content ext__stack-xl">
        <div className="ext__filters reveal" data-reveal="2">
          <div className="input-wrap">
            <input
              className="input"
              placeholder="Buscar por descripción o ID de vehículo…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {loading && <div className="mt8">Cargando intervenciones…</div>}
        </div>

        <section className="ext__panel reveal" data-reveal="3" aria-live="polite">
          <div className="ext__panelHeader">
            <div className="ext__panelTitle">Registrar intervención externa</div>
            <button type="button" className="btnGhost" onClick={limpiarForm}>
              Limpiar
            </button>
          </div>

          <div className="ext__form">
            <div className="form-group">
              <label className="label" htmlFor="vehiculoId">
                Vehículo (ID numérico)
              </label>
              <div className="input-wrap">
                <input
                  id="vehiculoId"
                  className="input"
                  type="number"
                  min={1}
                  value={form.vehiculoId}
                  onChange={(e) => setForm((f) => ({ ...f, vehiculoId: e.target.value }))}
                  placeholder="Ejemplo: 12"
                />
              </div>
              <div className="ext__hint">
                <small style={{ color: "#64748b" }}>
                  En una siguiente iteración esto puede ser un selector de tus vehículos.
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="fecha">
                Fecha y hora de la intervención
              </label>
              <div className="input-wrap">
                <input
                  id="fecha"
                  className="input"
                  type="datetime-local"
                  value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="descripcion">
                Descripción del trabajo realizado
              </label>
              <div className="input-wrap">
                <textarea
                  id="descripcion"
                  className="input"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Ejemplo: Cambio de llantas realizado en otro taller, incluye balanceo y alineación."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="comprobanteUrl">
                URL de comprobante (opcional)
              </label>
              <div className="input-wrap">
                <input
                  id="comprobanteUrl"
                  className="input"
                  type="url"
                  value={form.comprobanteUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, comprobanteUrl: e.target.value }))
                  }
                  placeholder="Ejemplo: https://drive.google.com/..."
                />
              </div>
            </div>

            <div className="ext__formActions">
              <button
                type="button"
                className="mc-btn mc-btn--gradient"
                onClick={guardar}
                disabled={loading}
              >
                💾 Registrar intervención
              </button>
            </div>

            {err && <div className="error-message mt8">{err}</div>}
            {ok && <div className="success-message mt8">{ok}</div>}
          </div>
        </section>

        <div className="ext__grid reveal" data-reveal="4" role="list">
          {filtrados.map((i, idx) => (
            <article
              key={i.id}
              role="listitem"
              className="ext__card"
              data-reveal={String((idx % 5) + 1)}
            >
              <header className="ext__cardHeader">
                <div>
                  <div className="ext__vehiculo">
                    Vehículo #{i.vehiculoId}
                  </div>
                  <div className="ext__meta">
                    Intervención #{i.id} · {formatFecha(i.fecha)}
                  </div>
                </div>
              </header>

              <p className="ext__descripcion">{i.descripcion}</p>

              {i.comprobanteUrl && (
                <a
                  href={i.comprobanteUrl}
                  className="ext__chipLink"
                  target="_blank"
                  rel="noreferrer"
                >
                  📎 Ver comprobante
                </a>
              )}
            </article>
          ))}

          {!loading && filtrados.length === 0 && (
            <p className="mt8">
              Aún no has registrado intervenciones externas. Usa el formulario para agregar la primera.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
