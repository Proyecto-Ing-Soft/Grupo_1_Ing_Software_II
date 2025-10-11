import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./catalogoServicios.css";

type Estado = "ACTIVO" | "INACTIVO";
type Servicio = { id: number; nombre: string; descripcion: string; estado: Estado };

// === Config API ===
const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3001";
const BASE = `${API_URL}/catalogo-servicios`;

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Map BE ⇄ FE
type ServicioBE = { id: number; nombre: string; descripcion: string; activo: boolean };
const toFE = (s: ServicioBE): Servicio => ({
  id: s.id,
  nombre: s.nombre,
  descripcion: s.descripcion,
  estado: s.activo ? "ACTIVO" : "INACTIVO",
});
const toBE = (f: Partial<Servicio>) => ({
  nombre: (f.nombre ?? "").trim(),
  descripcion: (f.descripcion ?? "").trim(),
  activo: (f.estado ?? "ACTIVO") === "ACTIVO",
});

export default function CatalogoServiciosPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (x) => x.nombre.toLowerCase().includes(s) || x.descripcion.toLowerCase().includes(s)
    );
  }, [q, items]);

  // formulario
  const [form, setForm] = useState<Partial<Servicio>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Carga inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${BASE}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders() },
        });
        if (!res.ok) throw new Error(await res.text());
        const data: ServicioBE[] = await res.json();
        setItems(data.map(toFE));
      } catch (e: any) {
        setErr(e?.message || "Error al cargar el catálogo");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // reveal animations (igual que antes)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries)
        e.isIntersecting ? e.target.classList.add("animate-in") : e.target.classList.remove("animate-in");
    }, { threshold: 0.12 });
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, [filtrados.length]);

  const startCrear = () => {
    setEditId(null);
    setForm({ nombre: "", descripcion: "", estado: "ACTIVO" });
    setErr(null);
    setOk(null);
  };
  const startEditar = (s: Servicio) => {
    setEditId(s.id);
    setForm({ ...s });
    setErr(null);
    setOk(null);
  };
  const cancelar = () => { setEditId(null); setForm({}); setErr(null); setOk(null); };

  const guardar = async () => {
    setErr(null); setOk(null);
    const nombre = (form.nombre ?? "").trim();
    const descripcion = (form.descripcion ?? "").trim();
    const estado = (form.estado as Estado) ?? "ACTIVO";
    if (!nombre) return setErr("El nombre es obligatorio.");
    if (!descripcion) return setErr("La descripción es obligatoria.");

    try {
      if (editId) {
        const res = await fetch(`${BASE}/${editId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(toBE({ nombre, descripcion, estado })),
        });
        if (!res.ok) throw new Error(await res.text());
        const actualizado: ServicioBE = await res.json();
        setItems(prev => prev.map(s => (s.id === editId ? toFE(actualizado) : s)));
        setOk("Servicio actualizado.");
      } else {
        const res = await fetch(`${BASE}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(toBE({ nombre, descripcion, estado })),
        });
        if (!res.ok) throw new Error(await res.text());
        const creado: ServicioBE = await res.json();
        setItems(prev => [toFE(creado), ...prev]);
        setOk("Servicio creado.");
      }
      setEditId(null);
      setForm({});
    } catch (e: any) {
      setErr(parseHttpError(e?.message));
    }
  };

  // ← TOGGLE Activar / Desactivar con mensaje dinámico
  const toggleEstado = async (s: Servicio) => {
    const activar = s.estado === "INACTIVO";
    if (!confirm(`${activar ? "¿Activar" : "¿Desactivar"} servicio?`)) return;

    setErr(null); setOk(null);
    try {
      const res = await fetch(`${BASE}/${s.id}/estado`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ activo: activar }),
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(prev => prev.map(x => (x.id === s.id ? { ...x, estado: activar ? "ACTIVO" : "INACTIVO" } : x)));
      setOk(activar ? "Servicio activado." : "Servicio inactivado.");
    } catch (e: any) {
      setErr(parseHttpError(e?.message));
    }
  };

  return (
    <main className="svc">
      <header className="svc__header svc__stack-lg">
        <div className="svc__titleWrap reveal" data-reveal="1">
          <h1 className="svc__title">Catálogo de servicios</h1>
          <p className="svc__sub">Crea, edita y activa/desactiva ítems del catálogo.</p>
        </div>

        <div className="svc__toolbar reveal" data-reveal="2">
          <div className="svc__actions">
            <button type="button" className="mc-btn mc-btn--gradient" onClick={() => navigate("/inicio")}>
              <span className="mc-icon" aria-hidden>⬅️</span><span className="mc-btn__text">Volver al inicio</span>
            </button>
            <button type="button" className="mc-btn mc-btn--ghost" onClick={startCrear}>
              ➕ Nuevo servicio
            </button>
          </div>
        </div>
      </header>

      <section className="svc__content svc__stack-xl">
        <div className="svc__filters reveal" data-reveal="2">
          <div className="input-wrap">
            <input className="input" placeholder="Buscar por nombre o descripción…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {loading && <div className="mt8">Cargando…</div>}
        </div>

        {(editId !== null || form.nombre !== undefined) && (
          <section className="svc__panel reveal" data-reveal="3" aria-live="polite">
            <div className="svc__panelHeader">
              <div className="svc__panelTitle">{editId ? "Editar servicio" : "Nuevo servicio"}</div>
              <button type="button" className="btnGhost" onClick={cancelar}>Cancelar</button>
            </div>

            <div className="svc__form">
              <div className="form-group">
                <label className="label" htmlFor="nombre">Nombre</label>
                <div className="input-wrap">
                  <input id="nombre" className="input" value={form.nombre ?? ""} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="descripcion">Descripción</label>
                <div className="input-wrap">
                  <textarea id="descripcion" className="input" rows={3} value={form.descripcion ?? ""} onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="estado">Estado</label>
                <div className="input-wrap">
                  <select id="estado" className="input" value={form.estado ?? "ACTIVO"} onChange={(e) => setForm(f => ({ ...f, estado: e.target.value as Estado }))}>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="svc__formActions">
                <button type="button" className="mc-btn mc-btn--gradient" onClick={guardar}>💾 Guardar</button>
              </div>

              {err && <div className="error-message mt8">{err}</div>}
              {ok && <div className="success-message mt8">{ok}</div>}
            </div>
          </section>
        )}

        {/* Grid de cards */}
        <div className="svc__grid reveal" data-reveal="4" role="list">
          {filtrados.map((s, idx) => (
            <article
              key={s.id}
              role="listitem"
              className={`svc__card is-toned ${s.estado === "ACTIVO" ? "svc--act" : "svc--ina"}`}
              data-reveal={String((idx % 5) + 1)}
            >
              <header className="svc__cardHeader">
                <div className="badges">
                  <span className="badge badge--id">#{s.id}</span>
                  <span className="badge badge--estado" data-e={s.estado}>{s.estado}</span>
                </div>
                <div className="svc__cardActions">
                  <button className="btnActionDark" onClick={() => startEditar(s)}>✏️ Editar</button>
                  <button className="btnGhost" onClick={() => toggleEstado(s)}>
                    {s.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </header>

              <div className="svc__body">
                <div className="svc__nombre">{s.nombre}</div>
                <p className="svc__desc">{s.descripcion}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

// === Helpers ===
function parseHttpError(raw: string): string {
  try {
    const obj = JSON.parse(raw);
    if (obj?.message) {
      return Array.isArray(obj.message) ? obj.message.join(", ") : String(obj.message);
    }
  } catch {}
  return raw || "Error en la operación";
}
