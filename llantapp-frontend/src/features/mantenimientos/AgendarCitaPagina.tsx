import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas } from "./api";
import { apiVehiculos } from "../vehiculos/api";
import { esquemaCita, CitaForm } from "./citaSchemas";
import PreviewCita from "./componentes/PreviewCita";
import "./agendarCita.css";

type VehiculoLite = { id: number; placa: string; marca: string; modelo: string };

const OPCION_NUEVO = "__nuevo__";

export default function AgendarCitaPagina() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [vehiculos, setVehiculos] = useState<VehiculoLite[]>([]);
  const [loadingVeh, setLoadingVeh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Si el usuario tiene vehículos, inicialmente ocultamos el formulario.
  // Si no tiene, lo mostramos.
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);

  const [form, setForm] = useState<CitaForm>({
    tipo: "PREVENTIVO",
    vehiculoId: undefined,
    placaPreliminar: "",
    marcaPreliminar: "",
    modeloPreliminar: "",
    anioPreliminar: undefined,
    colorPreliminar: "",
    vinPreliminar: "",
    comentario: "",
    programadaPara: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingVeh(true);
        setError(null);
        const data = await apiVehiculos.mios();
        if (!alive) return;
        setVehiculos(data ?? []);
        // Regla: si hay vehículos → ocultar formulario (no preseleccionar ninguno).
        //        si no hay      → mostrar formulario.
        setMostrarFormNuevo((data ?? []).length === 0);
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "No se pudieron cargar tus vehículos");
          // En error, dejar visible el formulario para no bloquear al usuario.
          setMostrarFormNuevo(true);
        }
      } finally {
        if (alive) setLoadingVeh(false);
      }
    })();
    return () => { alive = false; };
  }, [usuario?.token]);

  const vehiculoSel = useMemo(
    () => vehiculos.find((v) => v.id === Number(form.vehiculoId)),
    [vehiculos, form.vehiculoId]
  );

  const onChangeCampo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "vehiculoId") {
      if (value === OPCION_NUEVO) {
        // Eligió "Registrar nuevo…" → mostrar formulario y limpiar selección
        setMostrarFormNuevo(true);
        setForm((s) => ({ ...s, vehiculoId: undefined }));
        return;
      }
      if (value === "") {
        // Volvió al placeholder “Elige uno…”
        setMostrarFormNuevo(false);
        setForm((s) => ({ ...s, vehiculoId: undefined }));
        return;
      }
      // Seleccionó un vehículo existente → ocultar formulario
      setMostrarFormNuevo(false);
      setForm((s) => ({ ...s, vehiculoId: Number(value) }));
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
      tipo: form.tipo,
      programadaPara: form.programadaPara,
      comentario: form.comentario || undefined,
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
    Boolean(form.vehiculoId) ||
    Boolean(
      (form.placaPreliminar ?? "").trim() &&
      (form.marcaPreliminar ?? "").trim() &&
      (form.modeloPreliminar ?? "").trim()
    );

  const soloFechaBonita = (v?: string) =>
    v ? new Date(v).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  const mostrandoSelector = !loadingVeh && vehiculos.length > 0;

  return (
    <main className="agendar">
      <section className="agendar__split">
        <div className="agendar__left">
          <header className="agendar__head">
            <h1 className="agendar__title">Agendar cita</h1>
            <p className="agendar__sub">
              Selecciona un vehículo registrado o registra uno nuevo para esta cita.
            </p>
          </header>

          <form className="form" onSubmit={enviar} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="tipo">Servicio</label>
              <div className="input-wrap">
                <select id="tipo" name="tipo" className="input" value={form.tipo} onChange={onChangeCampo}>
                  <option value="PREVENTIVO">Mantenimiento preventivo</option>
                  <option value="CORRECTIVO">Correctivo</option>
                  <option value="LEGAL_ITV">Legal / ITV</option>
                  <option value="EXTRAS">Extras</option>
                </select>
              </div>
            </div>

            {loadingVeh ? (
              <div className="helper">Cargando vehículos…</div>
            ) : mostrandoSelector ? (
              <div className="form-group">
                <label className="label" htmlFor="vehiculoId">Vehículo</label>
                <div className="input-wrap">
                  <select
                    id="vehiculoId"
                    name="vehiculoId"
                    className="input"
                    value={
                      form.vehiculoId
                        ? String(form.vehiculoId)
                        : (mostrarFormNuevo ? OPCION_NUEVO : "")
                    }
                    onChange={onChangeCampo}
                  >
                    <option value="" disabled>Elige uno…</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo}
                      </option>
                    ))}
                    <option value={OPCION_NUEVO}>Registrar nuevo vehículo…</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="helper">Aún no tienes vehículos registrados. Completa los datos abajo.</div>
            )}

            {(!mostrandoSelector || mostrarFormNuevo) && (
              <>
                <div className="form-group">
                  <label className="label" htmlFor="placaPreliminar">Placa</label>
                  <div className="input-wrap">
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
                    <label className="label" htmlFor="marcaPreliminar">Marca</label>
                    <div className="input-wrap">
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
                    <label className="label" htmlFor="modeloPreliminar">Modelo</label>
                    <div className="input-wrap">
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
                    <label className="label" htmlFor="anioPreliminar">Año (opcional)</label>
                    <div className="input-wrap">
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
                    <label className="label" htmlFor="colorPreliminar">Color (opcional)</label>
                    <div className="input-wrap">
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
                  <label className="label" htmlFor="vinPreliminar">VIN (opcional)</label>
                  <div className="input-wrap">
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
                <label className="label" htmlFor="programadaPara">Fecha programada</label>
                <div className="input-wrap">
                  <input
                    id="programadaPara"
                    name="programadaPara"
                    className="input"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.programadaPara}
                    onChange={onChangeCampo}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="comentario">Comentario (opcional)</label>
                <div className="input-wrap">
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

            <button type="submit" className="btn btn-primary" disabled={enviando || !puedeEnviar}>
              {enviando ? "Agendando…" : "Agendar"}
            </button>

            {error && <div className="error-message" role="alert">{error}</div>}
            {ok && <div className="success-message" role="status">Solicitud enviada.</div>}

            <p className="helper" style={{ marginTop: 8 }}>
              ¿Quieres salir?{" "}
              <span className="textlink" onClick={() => navigate("/inicio")}>Volver al inicio</span>
            </p>
          </form>
        </div>

        <aside className="agendar__right">
          <div className="preview-card">
            <PreviewCita
              form={{
                tipo: form.tipo,
                placaPreliminar: form.vehiculoId ? (vehiculoSel?.placa ?? "") : (form.placaPreliminar ?? ""),
                marcaPreliminar: form.vehiculoId ? (vehiculoSel?.marca ?? "") : (form.marcaPreliminar ?? ""),
                modeloPreliminar: form.vehiculoId ? (vehiculoSel?.modelo ?? "") : (form.modeloPreliminar ?? ""),
                programadaPara: soloFechaBonita(form.programadaPara),
              }}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
