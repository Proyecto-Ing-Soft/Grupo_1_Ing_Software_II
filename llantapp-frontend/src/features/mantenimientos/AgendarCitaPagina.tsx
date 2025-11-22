// llantapp-frontend/src/features/mantenimientos/AgendarCitaPagina.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas } from "./api";
import { apiVehiculos } from "../vehiculos/api";
import { esquemaCita, CitaForm } from "./citaSchemas";
import PreviewCita from "./componentes/PreviewCita";
import agendarCitaImg from "../../assets/priv/cliente/agendar-cita.png";
import "./agendarCita.css";

// 🔹 Importamos el API de servicios del catálogo
import { apiServicios, Servicio } from "../catalogo-servicios/api";

type VehiculoLite = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
};

type ServicioLite = Pick<Servicio, "id" | "nombre">;

const OPCION_NUEVO = "__nuevo__";

// Fecha local "YYYY-MM-DD" (sin UTC)
const yyyymmddLocal = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Parsear "YYYY-MM-DD" como Date LOCAL (para preview)
const parseYMDLocal = (ymd?: string) => {
  if (!ymd) return undefined;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d); // medianoche local
};

export default function AgendarCitaPagina() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [vehiculos, setVehiculos] = useState<VehiculoLite[]>([]);
  const [loadingVeh, setLoadingVeh] = useState(true);

  const [servicios, setServicios] = useState<ServicioLite[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Si el usuario tiene vehículos, inicialmente ocultamos el formulario nuevo.
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);

  const [form, setForm] = useState<CitaForm>({
    servicioId: undefined,
    vehiculoId: undefined,
    placaPreliminar: "",
    marcaPreliminar: "",
    modeloPreliminar: "",
    anioPreliminar: undefined,
    colorPreliminar: "",
    vinPreliminar: "",
    comentario: "",
    programadaPara: yyyymmddLocal(), // default hoy en local
  });

  // 🔹 Cargar vehículos del cliente
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingVeh(true);
        setError(null);
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

  // 🔹 Cargar servicios disponibles desde el catálogo (solo ACTIVO)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingServicios(true);
        const data = await apiServicios.listar(); // mismo endpoint que usa el admin
        if (!alive) return;

        const activos = (data ?? []).filter(
          (s: Servicio) => s.estado === "ACTIVO"
        );
        setServicios(
          activos
            .map((s) => ({ id: s.id, nombre: s.nombre }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      } catch (e) {
        console.error("Error cargando servicios:", e);
      } finally {
        if (alive) setLoadingServicios(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onChangeCampo = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      setForm((s) => ({
        ...s,
        servicioId: value === "" ? undefined : Number(value),
      }));
      return;
    }

    setForm((s) => ({
      ...s,
      [name]:
        name === "anioPreliminar"
          ? value === ""
            ? undefined
            : Number(value)
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
      servicioId: form.servicioId!,
      // El backend exige exactamente "YYYY-MM-DD"
      programadaPara: form.programadaPara,
      comentario: form.comentario || undefined,
    };

    if (form.vehiculoId) {
      payload.vehiculoId = Number(form.vehiculoId);
    } else {
      payload.placaPreliminar = form.placaPreliminar?.toUpperCase().trim();
      payload.marcaPreliminar = form.marcaPreliminar?.trim();
      payload.modeloPreliminar = form.modeloPreliminar?.trim();
      if (form.anioPreliminar != null)
        payload.anioPreliminar = Number(form.anioPreliminar);
      if (form.colorPreliminar)
        payload.colorPreliminar = form.colorPreliminar.trim();
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
                text: "Cita solicitada. Te avisaremos por notificación.",
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

  const servicioSel = useMemo(
    () =>
      form.servicioId
        ? servicios.find((s) => s.id === form.servicioId)
        : undefined,
    [servicios, form.servicioId]
  );

  // Preview con parseo LOCAL del "YYYY-MM-DD"
  const soloFechaBonita = (v?: string) => {
    const d = parseYMDLocal(v);
    return d
      ? d.toLocaleDateString("es-PE", { dateStyle: "medium" })
      : "—";
  };

  // min del date en local
  const hoyLocal = useMemo(() => yyyymmddLocal(), []);

  return (
    <main className="agendar">
      <section className="agendar__card">
        <div className="agendar__formCol">
          <header className="agendar__head">
            <h1 className="agendar__title">Agendar cita</h1>
            <p className="agendar__sub">
              Selecciona un servicio del catálogo y un vehículo registrado, o
              registra uno nuevo para esta cita.
            </p>
          </header>

          <div className="agendar__formScroll">
            <form className="form" onSubmit={enviar} noValidate>
              {/* 🔹 Servicio desde catálogo */}
              <div className="form-group">
                <label className="label" htmlFor="servicioId">
                  Servicio
                </label>
                <div className="input-wrap" data-ico="service">
                  {loadingServicios ? (
                    <div className="helper">Cargando servicios…</div>
                  ) : servicios.length === 0 ? (
                    <div className="helper">
                      No hay servicios disponibles. Consulta con tu taller.
                    </div>
                  ) : (
                    <select
                      id="servicioId"
                      name="servicioId"
                      className="input"
                      value={form.servicioId ?? ""}
                      onChange={onChangeCampo}
                    >
                      <option value="">Selecciona un servicio…</option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {loadingVeh ? (
                <div className="helper">Cargando vehículos…</div>
              ) : vehiculos.length > 0 ? (
                <div className="form-group">
                  <label className="label" htmlFor="vehiculoId">
                    Vehículo
                  </label>
                  <div className="input-wrap" data-ico="vehicle">
                    <select
                      id="vehiculoId"
                      name="vehiculoId"
                      className="input"
                      value={
                        form.vehiculoId
                          ? String(form.vehiculoId)
                          : mostrarFormNuevo
                          ? OPCION_NUEVO
                          : ""
                      }
                      onChange={onChangeCampo}
                    >
                      <option value="" disabled>
                        Elige uno…
                      </option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} — {v.marca} {v.modelo}
                        </option>
                      ))}
                      <option value={OPCION_NUEVO}>
                        Registrar nuevo vehículo…
                      </option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="helper">
                  Aún no tienes vehículos registrados. Completa los datos
                  abajo.
                </div>
              )}

              {(!(vehiculos.length > 0) || mostrarFormNuevo) && (
                <>
                  <div className="form-group">
                    <label className="label" htmlFor="placaPreliminar">
                      Placa
                    </label>
                    <div className="input-wrap" data-ico="plate">
                      <input
                        id="placaPreliminar"
                        name="placaPreliminar"
                        className="input"
                        placeholder="ABC-123"
                        value={form.placaPreliminar ?? ""}
                        onChange={onChangeCampo}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="marcaPreliminar">
                        Marca
                      </label>
                      <div className="input-wrap" data-ico="brand">
                        <input
                          id="marcaPreliminar"
                          name="marcaPreliminar"
                          className="input"
                          placeholder="Toyota"
                          value={form.marcaPreliminar ?? ""}
                          onChange={onChangeCampo}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="modeloPreliminar">
                        Modelo
                      </label>
                      <div className="input-wrap" data-ico="model">
                        <input
                          id="modeloPreliminar"
                          name="modeloPreliminar"
                          className="input"
                          placeholder="Corolla"
                          value={form.modeloPreliminar ?? ""}
                          onChange={onChangeCampo}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="label" htmlFor="anioPreliminar">
                        Año (opcional)
                      </label>
                      <div className="input-wrap" data-ico="year">
                        <input
                          id="anioPreliminar"
                          name="anioPreliminar"
                          className="input"
                          type="number"
                          min={1950}
                          max={new Date().getFullYear() + 1}
                          placeholder="2020"
                          value={form.anioPreliminar ?? ""}
                          onChange={onChangeCampo}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="colorPreliminar">
                        Color (opcional)
                      </label>
                      <div className="input-wrap" data-ico="color">
                        <input
                          id="colorPreliminar"
                          name="colorPreliminar"
                          className="input"
                          placeholder="Plata"
                          value={form.colorPreliminar ?? ""}
                          onChange={onChangeCampo}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="vinPreliminar">
                      VIN (opcional)
                    </label>
                    <div className="input-wrap" data-ico="vin">
                      <input
                        id="vinPreliminar"
                        name="vinPreliminar"
                        className="input"
                        placeholder="XXXXXXXXXXXXXXX"
                        value={form.vinPreliminar ?? ""}
                        onChange={onChangeCampo}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="label" htmlFor="programadaPara">
                    Fecha programada
                  </label>
                  <div className="input-wrap" data-ico="date">
                    <input
                      id="programadaPara"
                      name="programadaPara"
                      className="input"
                      type="date"
                      min={hoyLocal}
                      value={form.programadaPara}
                      onChange={onChangeCampo}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="comentario">
                    Comentario (opcional)
                  </label>
                  <div className="input-wrap" data-ico="comment">
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
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={enviando || !puedeEnviar}
              >
                {enviando ? "Agendando…" : "Agendar"}
              </button>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}
              {ok && (
                <div className="success-message" role="status">
                  Solicitud enviada.
                </div>
              )}

              <p className="helper" style={{ marginTop: 8 }}>
                ¿Quieres salir?{" "}
                <span
                  className="textlink"
                  onClick={() => navigate("/inicio")}
                >
                  Volver al inicio
                </span>
              </p>
            </form>
          </div>
        </div>

        <div className="agendar__previewCol">
          <div className="agendar__preview">
            <PreviewCita
              form={{
                // usamos el nombre del servicio como "tipo" en la tarjeta
                tipo: servicioSel?.nombre ?? "Servicio no seleccionado",
                placaPreliminar: form.vehiculoId
                  ? vehiculoSel?.placa ?? ""
                  : form.placaPreliminar ?? "",
                marcaPreliminar: form.vehiculoId
                  ? vehiculoSel?.marca ?? ""
                  : form.marcaPreliminar ?? "",
                modeloPreliminar: form.vehiculoId
                  ? vehiculoSel?.modelo ?? ""
                  : form.modeloPreliminar ?? "",
                programadaPara: soloFechaBonita(form.programadaPara),
              }}
            />
          </div>
        </div>

        <aside className="agendar__art">
          <img
            src={agendarCitaImg}
            alt="Agendar cita — cliente"
            className="agendar__img"
          />
        </aside>
      </section>
    </main>
  );
}
