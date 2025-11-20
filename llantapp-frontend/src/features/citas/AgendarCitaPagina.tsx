import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas } from "./api";
import { apiVehiculos } from "../vehiculos/api";
import { esquemaCita, CitaForm } from "./citaSchemas";
import PreviewCita from "./componentes/PreviewCita";
import agendarCitaImg from "../../assets/priv/cliente/agendar-cita.png";
import "./agendarCita.css";

type VehiculoLite = { id: number; placa: string; marca: string; modelo: string };
type ServicioLite = { id: number; nombre: string };

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
  const [servicios, setServicios] = useState<ServicioLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState<CitaForm>({
    vehiculoId: undefined,
    servicioId: undefined,
    comentario: "",
    programadaPara: yyyymmddLocal(), // default hoy en local
  } as CitaForm);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [vehData, srvData] = await Promise.all([
          apiVehiculos.mios(),
          apiCitas.serviciosDisponibles(),
        ]);
        if (!alive) return;
        setVehiculos(vehData ?? []);
        setServicios(srvData ?? []);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "No se pudieron cargar tus datos para agendar la cita");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [usuario?.token]);

  const onChangeCampo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({
      ...s,
      [name]: value,
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

    const data = parsed.data;
    const vehiculoIdNum = Number(data.vehiculoId);
    const servicioIdNum = Number(data.servicioId);

    const fechaProgramadaIso = new Date(`${data.programadaPara}T00:00:00`).toISOString();

    const payload = {
      vehiculoId: vehiculoIdNum,
      servicioId: servicioIdNum,
      comentario: data.comentario || undefined,
      fechaProgramada: fechaProgramadaIso,
    };

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
    Boolean(form.vehiculoId) &&
    Boolean(form.servicioId) &&
    Boolean((form.programadaPara ?? "").trim());

  const vehiculoSel = useMemo(
    () => vehiculos.find((v) => v.id === Number(form.vehiculoId)),
    [vehiculos, form.vehiculoId]
  );

  const servicioSel = useMemo(
    () => servicios.find((s) => s.id === Number(form.servicioId)),
    [servicios, form.servicioId]
  );

  // Preview con parseo LOCAL del "YYYY-MM-DD"
  const soloFechaBonita = (v?: string) => {
    const d = parseYMDLocal(v);
    return d ? d.toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";
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
              Selecciona un vehículo registrado y un servicio disponible para agendar tu cita.
            </p>
          </header>

          <div className="agendar__formScroll">
            <form className="form" onSubmit={enviar} noValidate>
              {loading && (
                <div className="helper" style={{ marginBottom: 12 }}>
                  Cargando vehículos y servicios…
                </div>
              )}

              <div className="form-group">
                <label className="label" htmlFor="vehiculoId">
                  Vehículo
                </label>
                <div className="input-wrap" data-ico="vehicle">
                  {vehiculos.length > 0 ? (
                    <select
                      id="vehiculoId"
                      name="vehiculoId"
                      className="input"
                      value={form.vehiculoId ? String(form.vehiculoId) : ""}
                      onChange={onChangeCampo}
                    >
                      <option value="" disabled>
                        Elige un vehículo…
                      </option>
                      {vehiculos.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.placa} — {v.marca} {v.modelo}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="helper">
                      Aún no tienes vehículos registrados. Solicita al taller que registre tu
                      vehículo antes de agendar una cita.
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="servicioId">
                  Servicio
                </label>
                <div className="input-wrap" data-ico="service">
                  {servicios.length > 0 ? (
                    <select
                      id="servicioId"
                      name="servicioId"
                      className="input"
                      value={form.servicioId ? String(form.servicioId) : ""}
                      onChange={onChangeCampo}
                    >
                      <option value="" disabled>
                        Elige un servicio…
                      </option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="helper">
                      No hay servicios disponibles en este momento. Inténtalo más tarde.
                    </p>
                  )}
                </div>
              </div>

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
                disabled={enviando || !puedeEnviar || vehiculos.length === 0 || servicios.length === 0}
              >
                {enviando ? "Agendando…" : "Agendar cita"}
              </button>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}
              {ok && (
                <div className="success-message" role="status">
                  Cita solicitada.
                </div>
              )}

              <p className="helper" style={{ marginTop: 8 }}>
                ¿Quieres salir?{" "}
                <span className="textlink" onClick={() => navigate("/inicio")}>
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
                servicioNombre: servicioSel?.nombre ?? "",
                placa: vehiculoSel?.placa ?? "",
                marca: vehiculoSel?.marca ?? "",
                modelo: vehiculoSel?.modelo ?? "",
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
