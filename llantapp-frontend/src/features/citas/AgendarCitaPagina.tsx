import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas } from "./api";
import { apiVehiculos } from "../vehiculos/api";
import { apiCatalogoServicios } from "../catalogo-servicios/api";
import { esquemaCita, CitaForm } from "./citaSchemas";
import PreviewCita from "./componentes/PreviewCita";
import agendarCitaImg from "../../assets/priv/cliente/agendar-cita.png";
import "./agendarCita.css";

type VehiculoLite = { id: number; placa: string; marca: string; modelo: string };
type ServicioLite = { id: number; nombre: string; descripcion: string; estado: string };

const OPCION_NUEVO = "__nuevo__";

const yyyymmddLocal = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const parseYMDLocal = (ymd?: string) => {
  if (!ymd) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function AgendarCitaPagina() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [vehiculos, setVehiculos] = useState<VehiculoLite[]>([]);
  const [servicios, setServicios] = useState<ServicioLite[]>([]);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [loadingServ, setLoadingServ] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);

  const [form, setForm] = useState<CitaForm>({
    vehiculoId: undefined,
    servicioId: undefined,
    placaPreliminar: "",
    marcaPreliminar: "",
    modeloPreliminar: "",
    anioPreliminar: undefined,
    colorPreliminar: "",
    vinPreliminar: "",
    comentario: "",
    fechaProgramada: yyyymmddLocal(),
  });

  // Cargar vehículos del cliente
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingVeh(true);
        const data = await apiVehiculos.mios();
        if (!alive) return;
        setVehiculos(data ?? []);
        setMostrarFormNuevo((data ?? []).length === 0);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "No se pudieron cargar tus vehículos");
          setMostrarFormNuevo(true);
        }
      } finally {
        if (alive) setLoadingVeh(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [usuario?.token]);

  // Cargar servicios del catálogo
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingServ(true);
        const data = await apiCatalogoServicios.listar();
        if (active) {
          const activos = data.filter((s) => s.estado === "ACTIVO");
          setServicios(activos);
        }
      } catch (e: any) {
        if (active) setError(e?.message || "No se pudieron cargar los servicios");
      } finally {
        if (active) setLoadingServ(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onChangeCampo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "vehiculoId") {
      if (value === OPCION_NUEVO) {
        setMostrarFormNuevo(true);
        setForm((s) => ({ ...s, vehiculoId: undefined }));
        return;
      }
      if (value === "") {
        setMostrarFormNuevo(false);
        setForm((s) => ({ ...s, vehiculoId: undefined }));
        return;
      }
      setMostrarFormNuevo(false);
      setForm((s) => ({ ...s, vehiculoId: Number(value) }));
      return;
    }

    if (name === "servicioId") {
      setForm((s) => ({ ...s, servicioId: Number(value) }));
      return;
    }

    setForm((s) => ({
      ...s,
      [name]:
        name === "anioPreliminar"
          ? value === "" ? undefined : Number(value)
          : value,
    }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    const parsed = esquemaCita.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setError(first?.message || "Datos inválidos");
      return;
    }

    const payload: any = {
      fechaProgramada: form.fechaProgramada,
      comentario: form.comentario || undefined,
      servicioId: Number(form.servicioId),
    };

    if (form.vehiculoId) {
      payload.vehiculoId = Number(form.vehiculoId);
    } else {
      payload.placaPreliminar = form.placaPreliminar?.toUpperCase().trim();
      payload.marcaPreliminar = form.marcaPreliminar?.trim();
      payload.modeloPreliminar = form.modeloPreliminar?.trim();
      if (form.anioPreliminar != null) payload.anioPreliminar = Number(form.anioPreliminar);
      if (form.colorPreliminar) payload.colorPreliminar = form.colorPreliminar.trim();
      if (form.vinPreliminar) payload.vinPreliminar = form.vinPreliminar.trim();
    }

    try {
      setEnviando(true);
      await apiCitas.crear(payload);
      setOk(true);
      setTimeout(
        () =>
          navigate("/inicio", {
            replace: true,
            state: {
              flash: {
                type: "success",
                text: "Cita solicitada correctamente.",
                ttlMs: 4000,
              },
            },
          }),
        900
      );
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la cita");
    } finally {
      setEnviando(false);
    }
  };

  const puedeEnviar =
    Boolean(form.servicioId) &&
    (Boolean(form.vehiculoId) ||
      Boolean(
        (form.placaPreliminar ?? "").trim() &&
        (form.marcaPreliminar ?? "").trim() &&
        (form.modeloPreliminar ?? "").trim()
      ));

  const vehiculoSel = useMemo(
    () => vehiculos.find((v) => v.id === Number(form.vehiculoId)),
    [vehiculos, form.vehiculoId]
  );

  const hoyLocal = useMemo(() => yyyymmddLocal(), []);

  const soloFechaBonita = (v?: string) => {
    const d = parseYMDLocal(v);
    return d ? d.toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";
  };

  return (
    <main className="agendar">
      <section className="agendar__card">
        <div className="agendar__formCol">
          <header className="agendar__head">
            <h1 className="agendar__title">Agendar cita</h1>
            <p className="agendar__sub">Selecciona un servicio y un vehículo o regístralo para continuar.</p>
          </header>

          <div className="agendar__formScroll">
            <form className="form" onSubmit={enviar} noValidate>
              
              <div className="form-group">
                <label className="label" htmlFor="servicioId">Servicio</label>
                <div className="input-wrap" data-ico="service">
                  {loadingServ ? (
                    <div className="helper">Cargando servicios…</div>
                  ) : (
                    <select
                      id="servicioId"
                      name="servicioId"
                      className="input"
                      value={form.servicioId ?? ""}
                      onChange={onChangeCampo}
                    >
                      <option value="" disabled>Elige un servicio…</option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Bloque vehículos y formulario igual que antes */}
              {loadingVeh ? (
                <div className="helper">Cargando vehículos…</div>
              ) : vehiculos.length > 0 ? (
                <div className="form-group">
                  <label className="label" htmlFor="vehiculoId">Vehículo</label>
                  <div className="input-wrap" data-ico="vehicle">
                    <select
                      id="vehiculoId"
                      name="vehiculoId"
                      className="input"
                      value={
                        form.vehiculoId
                          ? String(form.vehiculoId)
                          : mostrarFormNuevo
                          ? "__nuevo__"
                          : ""
                      }
                      onChange={onChangeCampo}
                    >
                      <option value="" disabled>Elige uno…</option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} — {v.marca} {v.modelo}
                        </option>
                      ))}
                      <option value="__nuevo__">Registrar nuevo vehículo…</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="helper">Aún no tienes vehículos registrados.</div>
              )}

              {/* Campos preliminares se mantienen igual */}
              {(!(vehiculos.length > 0) || mostrarFormNuevo) && (
                <>
                  <div className="form-group">
                    <label className="label" htmlFor="placaPreliminar">Placa</label>
                    <input
                      id="placaPreliminar"
                      name="placaPreliminar"
                      className="input"
                      placeholder="ABC-123"
                      value={form.placaPreliminar ?? ""}
                      onChange={onChangeCampo}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="marcaPreliminar">Marca</label>
                      <input
                        id="marcaPreliminar"
                        name="marcaPreliminar"
                        className="input"
                        value={form.marcaPreliminar ?? ""}
                        onChange={onChangeCampo}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="modeloPreliminar">Modelo</label>
                      <input
                        id="modeloPreliminar"
                        name="modeloPreliminar"
                        className="input"
                        value={form.modeloPreliminar ?? ""}
                        onChange={onChangeCampo}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="label" htmlFor="fechaProgramada">Fecha programada</label>
                  <input
                    id="fechaProgramada"
                    name="fechaProgramada"
                    className="input"
                    type="date"
                    min={hoyLocal}
                    value={form.fechaProgramada}
                    onChange={onChangeCampo}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="comentario">Comentario (opcional)</label>
                  <input
                    id="comentario"
                    name="comentario"
                    className="input"
                    placeholder="Observaciones…"
                    value={form.comentario ?? ""}
                    onChange={onChangeCampo}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={enviando || !puedeEnviar}>
                {enviando ? "Agendando…" : "Agendar"}
              </button>

              {error && <div className="error-message mt8">{error}</div>}
              {ok && <div className="success-message mt8">Cita registrada.</div>}
            </form>
          </div>
        </div>

        <div className="agendar__previewCol">
          <PreviewCita
            form={{
              placaPreliminar: form.vehiculoId
                ? vehiculoSel?.placa ?? ""
                : form.placaPreliminar ?? "",
              marcaPreliminar: form.vehiculoId
                ? vehiculoSel?.marca ?? ""
                : form.marcaPreliminar ?? "",
              modeloPreliminar: form.vehiculoId
                ? vehiculoSel?.modelo ?? ""
                : form.modeloPreliminar ?? "",
              programadaPara: soloFechaBonita(form.fechaProgramada),
            }}
          />
        </div>
        <aside className="agendar__art">
          <img src={agendarCitaImg} alt="Agendar cita" className="agendar__img" />
        </aside>
      </section>
    </main>
  );
}