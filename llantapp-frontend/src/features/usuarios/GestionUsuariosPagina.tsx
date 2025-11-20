import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./gestionarUsuarios.css";
import { apiUsuarios } from "./api";
import { useAuth } from "../../core/auth/AuthContext";

// PRINCIPIO (SRP):
// Este componente se centra en orquestar la UI de gestión de personal de taller,
// delegando todo acceso a datos en apiUsuarios (facade HTTP).

type Usuario = {
  id: number;
  nombreCompleto: string;
  correo: string;
  rol: string; // código de rol en BD (ej. ADMIN_TALLER, MECANICO)
};

export default function GestionUsuariosPagina() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [items, setItems] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Carga inicial desde la BD del personal de taller.
  useEffect(() => {
    let cancelado = false;

    async function cargarPersonal() {
      // SRP: esta función solo orquesta la llamada al API de personal de taller.
      setCargando(true);
      setErr(null);
      try {
        const data = await apiUsuarios.listarTaller();

        if (!cancelado) {
          setItems(
            (data ?? []).map((u) => ({
              id: u.id,
              nombreCompleto: u.nombreCompleto,
              correo: (u as any).correo ?? (u as any).email ?? "",
              rol: u.rol,
            })),
          );
        }
      } catch (e: any) {
        if (!cancelado) {
          setErr(
            e?.message ??
              "No se pudo cargar el personal del taller. Verifica tu conexión o vuelve a intentar.",
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    if (sesion.accessToken) {
      cargarPersonal();
    } else {
      setCargando(false);
    }

    return () => {
      cancelado = true;
    };
  }, [sesion.accessToken]);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((u) => {
      const rol = (u.rol ?? "").toLowerCase();
      return (
        u.nombreCompleto.toLowerCase().includes(s) ||
        u.correo.toLowerCase().includes(s) ||
        rol.includes(s)
      );
    });
  }, [q, items]);

  // Mantiene las animaciones de entrada de las tarjetas.
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );
    const t = window.setTimeout(
      () => nodes.forEach((n) => n.classList.add("will-animate")),
      0,
    );

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("animate-in");
          } else {
            e.target.classList.remove("animate-in");
          }
        }
      },
      { threshold: 0.12 },
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
  }, [filtrados.length]);

  const startEditar = (u: Usuario) => {
    setEditId(u.id);
    setForm({
      id: u.id,
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      rol: u.rol,
    });
    setErr(null);
    setOk(null);
  };

  const cancelar = () => {
    setEditId(null);
    setForm({});
    setErr(null);
    setOk(null);
  };

  // Actualiza un usuario de taller contra el backend.
  const guardar = async () => {
    if (editId == null) return;

    setErr(null);
    setOk(null);

    const nombreCompleto = (form.nombreCompleto ?? "").trim();
    const correo = (form.correo ?? "").trim();
    const rol = (form.rol ?? "").trim();

    if (!nombreCompleto) {
      setErr("El nombre completo es obligatorio.");
      return;
    }
    if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
      setErr("Correo inválido.");
      return;
    }

    try {
      const duplicado = items.some(
        (u) =>
          u.id !== editId &&
          u.correo.toLowerCase() === correo.toLowerCase(),
      );
      if (duplicado) {
        setErr("Ya existe un usuario con ese correo.");
        return;
      }

      const actualizado = await apiUsuarios.actualizarPersonalTaller(
        editId,
        {
          nombreCompleto,
          correo,
          rol: rol || undefined,
        },
      );

      setItems((prev) =>
        prev.map((u) =>
          u.id === editId
            ? {
                id: actualizado.id,
                nombreCompleto: actualizado.nombreCompleto,
                correo:
                  (actualizado as any).correo ??
                  (actualizado as any).email ??
                  correo,
                rol: actualizado.rol,
              }
            : u,
        ),
      );

      setOk("Usuario actualizado.");
      setEditId(null);
      setForm({});
    } catch (e: any) {
      setErr(
        e?.message ??
          "No se pudo actualizar el usuario. Intenta nuevamente.",
      );
    }
  };

  // Elimina personal de taller en la BD.
  const eliminar = async (id: number) => {
    if (!window.confirm("¿Eliminar usuario del taller?")) return;

    setErr(null);
    setOk(null);

    try {
      await apiUsuarios.eliminarPersonalTaller(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
      setOk("Usuario eliminado.");
    } catch (e: any) {
      setErr(
        e?.message ??
          "No se pudo eliminar el usuario. Intenta nuevamente.",
      );
    }
  };

  return (
    <main className="usr">
      <header className="usr__header usr__stack-lg">
        <div className="usr__titleWrap reveal" data-reveal="1">
          <h1 className="usr__title">Gestionar personal del taller</h1>
          <p className="usr__sub">
            Consulta, edita y administra a los usuarios con rol de taller
            (administradores y mecánicos) registrados en la base de datos.
          </p>
        </div>

        <div className="usr__toolbar reveal" data-reveal="2">
          <div className="usr__actions">
            <button
              type="button"
              className="mc-btn mc-btn--gradient"
              onClick={() => navigate("/inicio")}
            >
              <span className="mc-icon" aria-hidden>
                ⬅️
              </span>
              <span className="mc-btn__text">Volver al inicio</span>
            </button>
          </div>
        </div>
      </header>

      <section className="usr__content usr__stack-xl">
        <div className="usr__filters reveal" data-reveal="2">
          <div className="input-wrap">
            <input
              className="input"
              placeholder="Buscar por nombre, correo o rol…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {cargando && (
          <div className="usr__panel reveal" data-reveal="3">
            <p>Cargando personal del taller…</p>
          </div>
        )}

        {!cargando && err && !editId && (
          <div className="usr__panel reveal" data-reveal="3">
            <div className="error-message">{err}</div>
          </div>
        )}

        {editId !== null && (
          <section
            className="usr__panel reveal"
            data-reveal="3"
            aria-live="polite"
          >
            <div className="usr__panelHeader">
              <div className="usr__panelTitle">Editar usuario</div>
              <button
                type="button"
                className="btnGhost"
                onClick={cancelar}
              >
                Cancelar
              </button>
            </div>

            <div className="usr__form">
              <div className="form-group">
                <label className="label" htmlFor="nombreCompleto">
                  Nombre completo
                </label>
                <div className="input-wrap">
                  <input
                    id="nombreCompleto"
                    className="input"
                    value={form.nombreCompleto ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        nombreCompleto: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="correo">
                  Correo
                </label>
                <div className="input-wrap">
                  <input
                    id="correo"
                    className="input"
                    value={form.correo ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        correo: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="rol">
                  Rol (código en BD)
                </label>
                <div className="input-wrap">
                  <select
                    id="rol"
                    className="input"
                    value={form.rol ?? "MECANICO"}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, rol: e.target.value }))
                    }
                  >
                    {/* Los códigos de rol válidos provienen de la tabla app.rol en la BD. */}
                    <option value="ADMIN_TALLER">ADMIN_TALLER</option>
                    <option value="MECANICO">MECANICO</option>
                  </select>
                </div>
              </div>

              <div className="usr__formActions">
                <button
                  type="button"
                  className="mc-btn mc-btn--gradient"
                  onClick={guardar}
                >
                  💾 Guardar cambios
                </button>
              </div>

              {err && <div className="error-message mt8">{err}</div>}
              {ok && <div className="success-message mt8">{ok}</div>}
            </div>
          </section>
        )}

        <div className="usr__grid reveal" data-reveal="4" role="list">
          {filtrados.map((u, idx) => (
            <article
              key={u.id}
              role="listitem"
              className="usr__card is-toned"
              data-reveal={String((idx % 5) + 1)}
            >
              <header className="usr__cardHeader">
                <div className="badges">
                  <span className="badge badge--id">#{u.id}</span>
                  <span className="badge badge--rol">{u.rol}</span>
                </div>
                <div className="usr__cardActions">
                  <button
                    className="btnActionDark"
                    onClick={() => startEditar(u)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btnGhost"
                    onClick={() => eliminar(u.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </header>

              <div className="usr__body">
                <div className="usr__nombre">{u.nombreCompleto}</div>
                <div className="usr__meta">
                  <span className="metaItem">Correo: {u.correo}</span>
                </div>
              </div>
            </article>
          ))}

          {!cargando && !filtrados.length && (
            <div className="usr__panel">
              <p>No se encontró personal de taller para mostrar.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
