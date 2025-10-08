import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./gestionarUsuarios.css";

type Rol = "ADMIN" | "MECANICO";
type Usuario = { id: number; nombre: string; correo: string; rol: Rol; activo: boolean };

let _uid = 3;

export default function GestionUsuariosPagina() {
  const navigate = useNavigate();

  // Mock inicial (luego apiUsuarios.listar())
  const [items, setItems] = useState<Usuario[]>([
    { id: 1, nombre: "Admin Principal", correo: "admin@llantapp.com", rol: "ADMIN", activo: true },
    { id: 2, nombre: "Mecánico Luis", correo: "luis@llantapp.com", rol: "MECANICO", activo: true },
  ]);

  const [q, setQ] = useState("");
  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(u =>
      u.nombre.toLowerCase().includes(s) ||
      u.correo.toLowerCase().includes(s) ||
      u.rol.toLowerCase().includes(s)
    );
  }, [q, items]);

  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver((entries) => { for (const e of entries) e.isIntersecting ? e.target.classList.add("animate-in") : e.target.classList.remove("animate-in"); }, { threshold: .12 });
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, [filtrados.length]);

  const startCrear = () => { setEditId(null); setForm({ nombre: "", correo: "", rol: "MECANICO", activo: true }); setErr(null); setOk(null); };
  const startEditar = (u: Usuario) => { setEditId(u.id); setForm({ ...u }); setErr(null); setOk(null); };
  const cancelar = () => { setEditId(null); setForm({}); setErr(null); setOk(null); };

  const guardar = () => {
    setErr(null); setOk(null);
    const nombre = (form.nombre ?? "").trim();
    const correo = (form.correo ?? "").trim();
    const rol = (form.rol as Rol) ?? "MECANICO";
    const activo = !!form.activo;

    if (!nombre) return setErr("El nombre es obligatorio.");
    if (!correo || !/\S+@\S+\.\S+/.test(correo)) return setErr("Correo inválido.");
    const duplicado = items.some(u => u.correo.toLowerCase() === correo.toLowerCase() && u.id !== editId);
    if (duplicado) return setErr("Ya existe un usuario con ese correo.");

    if (editId) {
      setItems(prev => prev.map(u => u.id === editId ? { ...u, nombre, correo, rol, activo } : u));
      setOk("Usuario actualizado.");
    } else {
      setItems(prev => [{ id: ++_uid, nombre, correo, rol, activo }, ...prev]);
      setOk("Usuario creado.");
    }
    setEditId(null); setForm({});
  };

  const eliminar = (id: number) => {
    if (!confirm("¿Eliminar usuario?")) return;
    setItems(prev => prev.filter(x => x.id !== id));
  };

  return (
    <main className="usr">
      <header className="usr__header usr__stack-lg">
        <div className="usr__titleWrap reveal" data-reveal="1">
          <h1 className="usr__title">Gestionar usuarios del taller</h1>
          <p className="usr__sub">Crea, edita y elimina usuarios administradores o mecánicos.</p>
        </div>

        <div className="usr__toolbar reveal" data-reveal="2">
          <div className="usr__actions">
            <button type="button" className="mc-btn mc-btn--gradient" onClick={() => navigate("/inicio")}>
              <span className="mc-icon" aria-hidden>⬅️</span><span className="mc-btn__text">Volver al inicio</span>
            </button>
            <button type="button" className="mc-btn mc-btn--ghost" onClick={startCrear}>➕ Nuevo usuario</button>
          </div>
        </div>
      </header>

      <section className="usr__content usr__stack-xl">
        <div className="usr__filters reveal" data-reveal="2">
          <div className="input-wrap">
            <input className="input" placeholder="Buscar por nombre, correo o rol…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {(editId !== null || form.nombre !== undefined) && (
          <section className="usr__panel reveal" data-reveal="3" aria-live="polite">
            <div className="usr__panelHeader">
              <div className="usr__panelTitle">{editId ? "Editar usuario" : "Nuevo usuario"}</div>
              <button type="button" className="btnGhost" onClick={cancelar}>Cancelar</button>
            </div>

            <div className="usr__form">
              <div className="form-group">
                <label className="label" htmlFor="nombre">Nombre</label>
                <div className="input-wrap"><input id="nombre" className="input" value={form.nombre ?? ""} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} /></div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="correo">Correo</label>
                <div className="input-wrap"><input id="correo" className="input" value={form.correo ?? ""} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} /></div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="rol">Rol</label>
                <div className="input-wrap">
                  <select id="rol" className="input" value={form.rol ?? "MECANICO"} onChange={e => setForm(f => ({ ...f, rol: e.target.value as Rol }))}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MECANICO">MECANICO</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">Estado</label>
                <div className="usr__switch">
                  <input id="activo" type="checkbox" checked={!!form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} />
                  <label htmlFor="activo">Activo</label>
                </div>
              </div>

              <div className="usr__formActions">
                <button type="button" className="mc-btn mc-btn--gradient" onClick={guardar}>💾 Guardar</button>
              </div>

              {err && <div className="error-message mt8">{err}</div>}
              {ok && <div className="success-message mt8">{ok}</div>}
            </div>
          </section>
        )}

        <div className="usr__grid reveal" data-reveal="4" role="list">
          {filtrados.map((u, idx) => (
            <article key={u.id} role="listitem" className={`usr__card is-toned ${u.activo ? "usr--act" : "usr--ina"}`} data-reveal={String((idx % 5) + 1)}>
              <header className="usr__cardHeader">
                <div className="badges">
                  <span className="badge badge--id">#{u.id}</span>
                  <span className="badge badge--rol">{u.rol}</span>
                  <span className="badge badge--estado" data-e={u.activo ? "ACTIVO" : "INACTIVO"}>{u.activo ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="usr__cardActions">
                  <button className="btnActionDark" onClick={() => startEditar(u)}>✏️ Editar</button>
                  <button className="btnGhost" onClick={() => eliminar(u.id)}>🗑️ Eliminar</button>
                </div>
              </header>

              <div className="usr__body">
                <div className="usr__nombre">{u.nombre}</div>
                <div className="usr__meta">
                  <span className="metaItem">Correo: {u.correo}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
