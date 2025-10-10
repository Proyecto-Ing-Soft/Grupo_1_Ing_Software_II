// src/features/usuarios/GestionUsuariosPagina.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./gestionarUsuarios.css";
import { useAuth } from "../../core/auth/AuthContext";
import {
  apiUsuarios,
  UsuarioTaller,
  CrearUsuarioTallerDto,
  ActualizarUsuarioTallerDto,
  TallerRol,
} from "./api";
import {
  esquemaUsuarioTallerCrear,
  esquemaUsuarioTallerEditar,
} from "./usuarioSchemas";

export default function GestionUsuariosPagina() {
  const navigate = useNavigate();
  const { usuario, tieneRol } = useAuth();

  const [items, setItems] = useState<UsuarioTaller[]>([]);
  const [cargando, setCargando] = useState(true);
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [formCrear, setFormCrear] = useState<CrearUsuarioTallerDto | null>(null);
  const [formEditar, setFormEditar] = useState<ActualizarUsuarioTallerDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // ⬇️ NUEVO: estado para confirmación inline (sin window.confirm)
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  useEffect(() => {
    if (!tieneRol(["ADMIN"])) {
      navigate("/inicio", { replace: true });
    }
  }, [tieneRol, navigate]);

  const cargar = async () => {
    if (!usuario?.token) return;
    setCargando(true);
    setErr(null);
    try {
      const datos = await apiUsuarios.listarTaller(usuario.token);
      setItems(datos);
    } catch {
      try {
        const [admins, mecs] = await Promise.all([
          apiUsuarios.listarAdmins(usuario.token),
          apiUsuarios.listarMecs(usuario.token),
        ]);
        const merged = [...admins, ...mecs].filter(
          (u, i, arr) => arr.findIndex((z) => z.id === u.id) === i
        );
        setItems(merged);
      } catch (e: any) {
        setErr(e?.message || "No se pudo cargar usuarios");
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.token]);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (u) =>
        u.nombreCompleto.toLowerCase().includes(s) ||
        u.correo.toLowerCase().includes(s) ||
        u.rol.toLowerCase().includes(s)
    );
  }, [q, items]);

  const startCrear = () => {
    setEditId(null);
    setFormEditar(null);
    setFormCrear({ nombreCompleto: "", correo: "", clave: "", rol: "MECANICO" });
    setErr(null);
    setOk(null);
  };

  const startEditar = (u: UsuarioTaller) => {
    setFormCrear(null);
    setEditId(u.id);
    setFormEditar({
      nombreCompleto: u.nombreCompleto,
      correo: u.correo,
      rol: u.rol as TallerRol,
    });
    setErr(null);
    setOk(null);
  };

  const cancelar = () => {
    setEditId(null);
    setFormCrear(null);
    setFormEditar(null);
    setErr(null);
    setOk(null);
  };

  const guardarCrear = async () => {
    if (!formCrear || !usuario?.token) return;
    setErr(null);
    setOk(null);

    const val = esquemaUsuarioTallerCrear.safeParse(formCrear);
    if (!val.success) return setErr(val.error.issues?.[0]?.message || "Datos inválidos");

    try {
      const nuevo = await apiUsuarios.crearTaller(val.data, usuario.token);
      setItems((prev) => [nuevo, ...prev]);
      setOk("Usuario creado.");
      cancelar();
    } catch (e: any) {
      setErr(e?.message || "No se pudo crear el usuario");
    }
  };

  const guardarEditar = async () => {
    if (!formEditar || !usuario?.token || !editId) return;
    setErr(null);
    setOk(null);

    const val = esquemaUsuarioTallerEditar.safeParse(formEditar);
    if (!val.success) return setErr(val.error.issues?.[0]?.message || "Datos inválidos");

    try {
      const upd = await apiUsuarios.actualizarTaller(editId, val.data, usuario.token);
      setItems((prev) => prev.map((u) => (u.id === upd.id ? upd : u)));
      setOk("Usuario actualizado.");
      cancelar();
    } catch (e: any) {
      setErr(e?.message || "No se pudo actualizar el usuario");
    }
  };

  // ⬇️ CAMBIO: ya NO usamos window.confirm aquí.
  const pedirConfirmacionEliminar = (id: number) => {
    setDeleteErr(null);
    setDeleteId(id);
    setOk(null);
    setErr(null);
  };

  const confirmarEliminar = async () => {
    if (!usuario?.token || !deleteId) return;
    setDeleteErr(null);
    setDeleting(true);
    try {
      await apiUsuarios.eliminarTaller(deleteId, usuario.token);
      setItems((prev) => prev.filter((x) => x.id !== deleteId));
      setOk("Usuario eliminado.");
      setDeleteId(null);
    } catch (e: any) {
      setDeleteErr(e?.message || "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const cancelarEliminar = () => setDeleteId(null);

  return (
    <main className="usr">
      <header className="usr__header usr__stack-lg">
        <div className="usr__titleWrap reveal" data-reveal="1">
          <h1 className="usr__title">Gestionar usuarios del taller</h1>
          <p className="usr__sub">Crea, edita y elimina usuarios administradores o mecánicos.</p>
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
            <button type="button" className="mc-btn mc-btn--ghost" onClick={startCrear}>
              ➕ Nuevo usuario
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

        {(formCrear || formEditar) && (
          <section className="usr__panel reveal" data-reveal="3" aria-live="polite">
            <div className="usr__panelHeader">
              <div className="usr__panelTitle">{formCrear ? "Nuevo usuario" : "Editar usuario"}</div>
              <button type="button" className="btnGhost" onClick={cancelar}>
                Cancelar
              </button>
            </div>

            <div className="usr__form">
              <div className="form-group">
                <label className="label" htmlFor="nombreCompleto">
                  Nombre
                </label>
                <div className="input-wrap">
                  <input
                    id="nombreCompleto"
                    className="input"
                    value={(formCrear ?? formEditar)?.nombreCompleto ?? ""}
                    onChange={(e) =>
                      formCrear
                        ? setFormCrear((f) => ({
                            ...(f as CrearUsuarioTallerDto),
                            nombreCompleto: e.target.value,
                          }))
                        : setFormEditar((f) => ({
                            ...(f as ActualizarUsuarioTallerDto),
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
                    type="email"
                    value={(formCrear ?? formEditar)?.correo ?? ""}
                    onChange={(e) =>
                      formCrear
                        ? setFormCrear((f) => ({
                            ...(f as CrearUsuarioTallerDto),
                            correo: e.target.value,
                          }))
                        : setFormEditar((f) => ({
                            ...(f as ActualizarUsuarioTallerDto),
                            correo: e.target.value,
                          }))
                    }
                  />
                </div>
              </div>

              {formCrear && (
                <div className="form-group">
                  <label className="label" htmlFor="clave">
                    Contraseña inicial
                  </label>
                  <div className="input-wrap">
                    <input
                      id="clave"
                      className="input"
                      type="password"
                      value={(formCrear as CrearUsuarioTallerDto).clave}
                      onChange={(e) =>
                        setFormCrear((f) => ({
                          ...(f as CrearUsuarioTallerDto),
                          clave: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="label" htmlFor="rol">
                  Rol
                </label>
                <div className="input-wrap">
                  <select
                    id="rol"
                    className="input"
                    value={(formCrear ?? formEditar)?.rol ?? "MECANICO"}
                    onChange={(e) =>
                      formCrear
                        ? setFormCrear((f) => ({
                            ...(f as CrearUsuarioTallerDto),
                            rol: e.target.value as TallerRol,
                          }))
                        : setFormEditar((f) => ({
                            ...(f as ActualizarUsuarioTallerDto),
                            rol: e.target.value as TallerRol,
                          }))
                    }
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="MECANICO">MECANICO</option>
                  </select>
                </div>
              </div>

              <div className="usr__formActions">
                {formCrear ? (
                  <button type="button" className="mc-btn mc-btn--gradient" onClick={guardarCrear}>
                    💾 Crear
                  </button>
                ) : (
                  <button type="button" className="mc-btn mc-btn--gradient" onClick={guardarEditar}>
                    💾 Guardar
                  </button>
                )}
              </div>

              {err && <div className="error-message mt8">{err}</div>}
              {ok && <div className="success-message mt8">{ok}</div>}
            </div>
          </section>
        )}

        <div className="usr__grid reveal" data-reveal="4" role="list" aria-busy={cargando}>
          {cargando && <div className="usr__sub">Cargando…</div>}
          {!cargando &&
            filtrados.map((u, idx) => (
              <article
                key={u.id}
                role="listitem"
                className={`usr__card is-toned`}
                data-reveal={String((idx % 5) + 1)}
              >
                <header className="usr__cardHeader">
                  <div className="badges">
                    <span className="badge badge--id">#{u.id}</span>
                    <span className="badge badge--rol">{u.rol}</span>
                  </div>
                  <div className="usr__cardActions">
                    <button className="btnActionDark" onClick={() => startEditar(u)}>
                      ✏️ Editar
                    </button>
                    <button className="btnGhost" onClick={() => pedirConfirmacionEliminar(u.id)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </header>

                <div className="usr__body">
                  <div className="usr__nombre">{u.nombreCompleto}</div>
                  <div className="usr__meta">
                    <span className="metaItem">Correo: {u.correo}</span>
                    {u.creadoEn && (
                      <span className="metaItem">
                        Creado: {new Date(u.creadoEn).toLocaleDateString("es-PE")}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          {!cargando && filtrados.length === 0 && (
            <div className="usr__sub">No hay usuarios que coincidan con la búsqueda.</div>
          )}
        </div>
      </section>

      {/* ⬇️ Barra de confirmación inline fija abajo */}
      {deleteId !== null && (
        <div
          className="
            fixed left-1/2 -translate-x-1/2 bottom-4 z-50
            w-[calc(100%-1.5rem)] max-w-3xl
            bg-white border border-slate-200 rounded-2xl
            shadow-[0_16px_36px_rgba(2,6,23,.12)]
            px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3
          "
          role="alert"
          aria-live="assertive"
        >
          <div className="text-slate-900 font-semibold flex-1">
            ¿Seguro que quieres eliminar este usuario?
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={confirmarEliminar}
              disabled={deleting}
              className="
                px-3 py-2 rounded-xl font-semibold text-white
                bg-rose-600 hover:bg-rose-700
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              {deleting ? "Eliminando…" : "Sí, eliminar"}
            </button>

            <button
              onClick={cancelarEliminar}
              disabled={deleting}
              className="
                px-3 py-2 rounded-xl font-semibold
                text-slate-800 bg-white border border-slate-300 hover:bg-slate-50
                disabled:opacity-70 disabled:cursor-not-allowed
              "
            >
              Cancelar
            </button>
          </div>

          {deleteErr && <div className="text-sm text-rose-700">{deleteErr}</div>}
        </div>
      )}
    </main>
  );
}
