import React, { useEffect, useMemo, useState } from "react";
import {
  apiSolicitudesTaller,
  SolicitudTallerDTO,
  AprobarSolicitudResponse,
} from "./api";
import "./solicitudesTallerOwner.css";

export const SolicitudesTallerOwnerPagina: React.FC = () => {
  const [items, setItems] = useState<SolicitudTallerDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aprobandoId, setAprobandoId] = useState<number | null>(null);
  const [rechazandoId, setRechazandoId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [resultadoAprobacion, setResultadoAprobacion] =
    useState<AprobarSolicitudResponse | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [solicitudAprobacion, setSolicitudAprobacion] =
    useState<SolicitudTallerDTO | null>(null); // para el modal de aprobar

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiSolicitudesTaller.pendientesOwner();
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => {
      const blob = `${s.razonSocial} ${s.ruc} ${s.nombreContacto} ${s.emailContacto} ${s.adminNombre} ${s.adminEmail}`.toLowerCase();
      return blob.includes(q);
    });
  }, [items, busqueda]);

  // ---------- APROBAR ----------

  function abrirModalAprobar(s: SolicitudTallerDTO) {
    setSolicitudAprobacion(s);
  }

  async function confirmarAprobacion() {
    if (!solicitudAprobacion) return;
    const id = solicitudAprobacion.id;

    setAprobandoId(id);
    setError(null);

    try {
      const res = await apiSolicitudesTaller.aprobar(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      setResultadoAprobacion(res);
      setSolicitudAprobacion(null);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo aprobar la solicitud");
    } finally {
      setAprobandoId(null);
    }
  }

  // ---------- RECHAZAR ----------

  function abrirRechazo(id: number) {
    setRechazandoId(id);
    setMotivoRechazo("");
  }

  function cancelarRechazo() {
    setRechazandoId(null);
    setMotivoRechazo("");
  }

  async function confirmarRechazo(e: React.FormEvent) {
    e.preventDefault();
    if (!rechazandoId) return;
    if (!motivoRechazo.trim()) {
      alert("Debes indicar un motivo de rechazo.");
      return;
    }

    const id = rechazandoId;
    setError(null);
    setAprobandoId(id); // mismo flag para deshabilitar botones

    try {
      await apiSolicitudesTaller.rechazar(id, motivoRechazo.trim());
      setItems((prev) => prev.filter((s) => s.id !== id));
      cancelarRechazo();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo rechazar la solicitud");
    } finally {
      setAprobandoId(null);
    }
  }

  return (
    <main className="page page--solicitudes-taller">
      <header className="page-header">
        <div className="page-header-main">
          <h1>Solicitudes de nuevos talleres</h1>
          <p className="page-subtitle">
            Como <span className="page-subtitle-strong">owner</span>, revisa
            las solicitudes pendientes y apruébalas o recházalas. Al aprobar,
            se generará automáticamente el taller y el usuario administrador
            inicial.
          </p>
        </div>
        <div className="page-header-badge">
          <span className="badge-owner">
            <span>OWNER</span>
            <span>PANEL</span>
          </span>
        </div>
      </header>

      <section className="page-content">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {resultadoAprobacion && (
          <div
            className="alert alert-success alert-success--big"
            role="status"
          >
            <div className="alert-success-header">
              <div>
                <h2>Solicitud aprobada ✅</h2>
                <p className="alert-success-sub">
                  Se creó el taller{" "}
                  <b>{resultadoAprobacion.taller.nombre}</b> (ID{" "}
                  {resultadoAprobacion.taller.id}) y el usuario administrador
                  inicial.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-secondary"
                onClick={() => setResultadoAprobacion(null)}
              >
                Cerrar
              </button>
            </div>

            <div className="admin-info-grid">
              <div className="admin-info-block">
                <span className="admin-label">Taller creado</span>
                <span className="admin-value">
                  {resultadoAprobacion.taller.nombre} (ID{" "}
                  {resultadoAprobacion.taller.id})
                </span>
              </div>
              <div className="admin-info-block">
                <span className="admin-label">Admin inicial</span>
                <span className="admin-value">
                  {resultadoAprobacion.adminInicial.nombreCompleto}
                  <br />
                  <a
                    className="admin-link"
                    href={`mailto:${resultadoAprobacion.adminInicial.email}`}
                  >
                    {resultadoAprobacion.adminInicial.email}
                  </a>
                </span>
              </div>
            </div>

            <div className="password-box">
              <div className="password-box-header">
                <span className="password-label">
                  Contraseña inicial (solo se muestra una vez)
                </span>
                <span className="password-hint">
                  Compártela al administrador del taller.
                </span>
              </div>
              <div className="password-box-body">
                <code className="password-code">
                  {resultadoAprobacion.adminInicial.passwordInicial}
                </code>
                <span className="password-warning">
                  Copia esta clave ahora; por seguridad, LlantApp no volverá a
                  mostrarla después.
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="toolbar">
          <input
            type="search"
            placeholder="Buscar por razón social, RUC, contacto…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={cargar}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {loading && items.length === 0 ? (
          <div className="empty-state">
            <p>Cargando solicitudes…</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <p>No hay solicitudes pendientes.</p>
            <p className="empty-hint">
              Cuando un taller envíe su formulario, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className="col-id">#</th>
                  <th className="col-razon">Razón social / RUC</th>
                  <th className="col-contacto">Contacto</th>
                  <th className="col-admin">Admin inicial</th>
                  <th className="col-creado">Creado</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="id-pill">#{s.id}</span>
                    </td>
                    <td>
                      <div className="razon-nombre">
                        <strong>{s.razonSocial}</strong>
                      </div>
                      <div className="razon-ruc">
                        <span className="pill pill-soft">
                          <span>RUC:</span>&nbsp;
                          <a href="#" onClick={(e) => e.preventDefault()}>
                            {s.ruc}
                          </a>
                        </span>
                      </div>
                      {s.direccion && (
                        <div className="razon-dir">{s.direccion}</div>
                      )}
                    </td>
                    <td>
                      <div className="contacto-nombre">{s.nombreContacto}</div>
                      <div className="contacto-mail">
                        <a href={`mailto:${s.emailContacto}`}>
                          {s.emailContacto}
                        </a>
                      </div>
                      {s.telefono && (
                        <div className="contacto-tel">
                          <span className="pill">
                            Tel:&nbsp;{s.telefono}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-nombre">{s.adminNombre}</div>
                      <div className="admin-mail">
                        <a href={`mailto:${s.adminEmail}`}>{s.adminEmail}</a>
                      </div>
                    </td>
                    <td className="col-creado">
                      {new Date(s.creadoEn).toLocaleString()}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-approve"
                          disabled={aprobandoId !== null}
                          onClick={() => abrirModalAprobar(s)}
                        >
                          {aprobandoId === s.id ? "Aprobando…" : "Aprobar"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-reject"
                          disabled={aprobandoId !== null}
                          onClick={() => abrirRechazo(s.id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL APROBAR */}
        {solicitudAprobacion && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Aprobar solicitud #{solicitudAprobacion.id}</h2>
              <p style={{ marginBottom: 10 }}>
                Se creará el taller{" "}
                <strong>{solicitudAprobacion.razonSocial}</strong> y un usuario
                administrador inicial usando los datos de contacto. ¿Deseas
                continuar?
              </p>
              <div className="admin-info-grid">
                <div className="admin-info-block">
                  <span className="admin-label">Razón social</span>
                  <span className="admin-value">
                    {solicitudAprobacion.razonSocial}
                  </span>
                </div>
                <div className="admin-info-block">
                  <span className="admin-label">Contacto</span>
                  <span className="admin-value">
                    {solicitudAprobacion.nombreContacto}
                    <br />
                    <a
                      className="admin-link"
                      href={`mailto:${solicitudAprobacion.emailContacto}`}
                    >
                      {solicitudAprobacion.emailContacto}
                    </a>
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSolicitudAprobacion(null)}
                  disabled={aprobandoId !== null}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-approve"
                  onClick={confirmarAprobacion}
                  disabled={aprobandoId !== null}
                >
                  {aprobandoId === solicitudAprobacion.id
                    ? "Aprobando…"
                    : "Confirmar aprobación"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL RECHAZAR */}
        {rechazandoId && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Rechazar solicitud #{rechazandoId}</h2>
              <form onSubmit={confirmarRechazo}>
                <label>
                  Motivo del rechazo
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    rows={4}
                    required
                  />
                </label>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cancelarRechazo}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-reject">
                    Confirmar rechazo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
