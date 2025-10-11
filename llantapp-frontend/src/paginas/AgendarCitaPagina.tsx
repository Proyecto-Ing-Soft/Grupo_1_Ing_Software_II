import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { esquemaCita, type CitaForm } from "../features/mantenimientos/citaSchemas";
import { apiCitas } from "../features/mantenimientos/api";
import "../features/mantenimientos/agendarCita.css";
import PreviewCita from "../features/mantenimientos/componentes/PreviewCita";

const REDIRECT_DELAY = 1200;

export default function AgendarCitaPagina() {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  const [form, setForm] = useState<CitaForm>({
    tipo: "PREVENTIVO",
    placaPreliminar: "",
    marcaPreliminar: "",
    modeloPreliminar: "",
    anioPreliminar: undefined,
    colorPreliminar: "",
    vinPreliminar: "",
    comentario: "",
    programadaPara: "",
  });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  // Animación reveal
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e =>
        (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting)
      ),
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErr[name]) {
      setFieldErr((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false); setFormErr(null); setFieldErr({});
    const parsed = esquemaCita.safeParse(form);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path?.[0] ?? "");
        if (k) fe[k] = issue.message;
      }
      setFieldErr(fe);
      if (Object.keys(fe).length > 1) setFormErr("Faltan campos por completar.");
      else if (Object.keys(fe).length === 1) setFormErr(Object.values(fe)[0]);
      else setFormErr("Datos inválidos");
      return;
    }

    try {
      setEnviando(true);
      const payload = parsed.data;
      await apiCitas.crear({
        ...payload,
        colorPreliminar: payload.colorPreliminar || undefined,
        vinPreliminar: payload.vinPreliminar || undefined,
        comentario: payload.comentario || undefined,
      });

      setOk(true);
      timeoutRef.current = window.setTimeout(() => {
        navigate("/inicio", {
          replace: true,
          state: { flash: { type: "success", text: "Cita solicitada: quedará en PENDIENTE hasta asignación.", ttlMs: 4000 } },
        });
      }, REDIRECT_DELAY);
    } catch (err: unknown) {
      let msg = "No se pudo registrar la cita";
      if (typeof err === "object" && err !== null) {
        const e = err as any;
        if (e.message && typeof e.message === "string") msg = e.message;
        else if (e.response && typeof e.response === "object" && e.response.data?.message) msg = e.response.data.message;
      }
      if (msg.includes("Bad Request") || msg.includes("{")) msg = "La fecha programada debe ser hoy o una fecha futura.";
      setFormErr(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="agendar">
      <section className="agendar__split" role="region" aria-label="Formulario de cita">
        <div className="agendar__left reveal" data-reveal="1">
          <header className="agendar__head">
            <div>
              <h1 className="agendar__title">Agendar cita</h1>
              <p className="agendar__sub">Ingresa los datos del vehículo y la fecha programada.</p>
            </div>
          </header>

          <form className="form" onSubmit={enviar} noValidate aria-busy={enviando}>
            <div className="form-group reveal" data-reveal="2">
              <label className="label" htmlFor="tipo">Servicio</label>
              <div className={`input-wrap ${fieldErr["tipo"] ? "has-error" : ""}`}>
                <select
                  id="tipo"
                  name="tipo"
                  className="input"
                  value={form.tipo}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["tipo"]}
                  aria-describedby={fieldErr["tipo"] ? "err-tipo" : undefined}
                >
                  <option value="PREVENTIVO">Mantenimiento preventivo</option>
                  <option value="CORRECTIVO">Mantenimiento correctivo</option>
                  <option value="LEGAL_ITV">Revisión legal/ITV</option>
                  <option value="EXTRAS">Extras</option>
                </select>
              </div>
              {fieldErr["tipo"] && <div id="err-tipo" className="error-message" role="alert">{fieldErr["tipo"]}</div>}
            </div>

            <div className="form-row">
              <div className="form-group reveal" data-reveal="2">
                <label className="label" htmlFor="placaPreliminar">Placa</label>
                <div className={`input-wrap ${fieldErr["placaPreliminar"] ? "has-error" : ""}`}>
                  <input
                    id="placaPreliminar"
                    className="input"
                    name="placaPreliminar"
                    type="text"
                    placeholder="ABC-123"
                    value={form.placaPreliminar}
                    onChange={onChange}
                    aria-invalid={!!fieldErr["placaPreliminar"]}
                    aria-describedby={fieldErr["placaPreliminar"] ? "err-placa" : undefined}
                  />
                </div>
                {fieldErr["placaPreliminar"] && <div id="err-placa" className="error-message" role="alert">{fieldErr["placaPreliminar"]}</div>}
              </div>

              <div className="form-group reveal" data-reveal="2">
                <label className="label" htmlFor="programadaPara">Fecha programada</label>
                <div className={`input-wrap ${fieldErr["programadaPara"] ? "has-error" : ""}`}>
                  <input
                    id="programadaPara"
                    className="input"
                    name="programadaPara"
                    type="date"
                    value={form.programadaPara}
                    onChange={onChange}
                    aria-invalid={!!fieldErr["programadaPara"]}
                    aria-describedby={fieldErr["programadaPara"] ? "err-fecha" : undefined}
                  />
                </div>
                {fieldErr["programadaPara"] && <div id="err-fecha" className="error-message" role="alert">{fieldErr["programadaPara"]}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group reveal" data-reveal="3">
                <label className="label" htmlFor="marcaPreliminar">Marca</label>
                <div className={`input-wrap ${fieldErr["marcaPreliminar"] ? "has-error" : ""}`}>
                  <input
                    id="marcaPreliminar"
                    className="input"
                    name="marcaPreliminar"
                    type="text"
                    placeholder="Toyota"
                    value={form.marcaPreliminar}
                    onChange={onChange}
                    aria-invalid={!!fieldErr["marcaPreliminar"]}
                    aria-describedby={fieldErr["marcaPreliminar"] ? "err-marca" : undefined}
                  />
                </div>
                {fieldErr["marcaPreliminar"] && <div id="err-marca" className="error-message" role="alert">{fieldErr["marcaPreliminar"]}</div>}
              </div>

              <div className="form-group reveal" data-reveal="3">
                <label className="label" htmlFor="modeloPreliminar">Modelo</label>
                <div className={`input-wrap ${fieldErr["modeloPreliminar"] ? "has-error" : ""}`}>
                  <input
                    id="modeloPreliminar"
                    className="input"
                    name="modeloPreliminar"
                    type="text"
                    placeholder="Corolla"
                    value={form.modeloPreliminar}
                    onChange={onChange}
                    aria-invalid={!!fieldErr["modeloPreliminar"]}
                    aria-describedby={fieldErr["modeloPreliminar"] ? "err-modelo" : undefined}
                  />
                </div>
                {fieldErr["modeloPreliminar"] && <div id="err-modelo" className="error-message" role="alert">{fieldErr["modeloPreliminar"]}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group reveal" data-reveal="4">
                <label className="label" htmlFor="anioPreliminar">Año (opcional)</label>
                <div className={`input-wrap ${fieldErr["anioPreliminar"] ? "has-error" : ""}`}>
                  <input
                    id="anioPreliminar"
                    className="input"
                    name="anioPreliminar"
                    type="number"
                    placeholder="2020"
                    value={form.anioPreliminar ?? ""}
                    onChange={onChange}
                    aria-invalid={!!fieldErr["anioPreliminar"]}
                    aria-describedby={fieldErr["anioPreliminar"] ? "err-anio" : undefined}
                  />
                </div>
                {fieldErr["anioPreliminar"] && <div id="err-anio" className="error-message" role="alert">{fieldErr["anioPreliminar"]}</div>}
              </div>

              <div className="form-group reveal" data-reveal="4">
                <label className="label" htmlFor="colorPreliminar">Color (opcional)</label>
                <div className="input-wrap">
                  <input
                    id="colorPreliminar"
                    className="input"
                    name="colorPreliminar"
                    type="text"
                    placeholder="Plata"
                    value={form.colorPreliminar ?? ""}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group reveal" data-reveal="5">
                <label className="label" htmlFor="vinPreliminar">VIN (opcional)</label>
                <div className="input-wrap">
                  <input
                    id="vinPreliminar"
                    className="input"
                    name="vinPreliminar"
                    type="text"
                    placeholder="XXXXXXXXXXXXXXX"
                    value={form.vinPreliminar ?? ""}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-group reveal" data-reveal="5">
                <label className="label" htmlFor="comentario">Mensaje adicional (opcional)</label>
                <div className="input-wrap">
                  <textarea
                    id="comentario"
                    className="input"
                    name="comentario"
                    placeholder="Describe el problema…"
                    value={form.comentario ?? ""}
                    onChange={onChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary reveal" data-reveal="5" disabled={enviando}>
              {enviando ? "Enviando…" : "Solicitar cita"}
            </button>

            {formErr && (
              <div className="error-message mt8 reveal" role="alert" data-reveal="5">
                {formErr}
              </div>
            )}

            {ok && (
              <div className="success-message mt8 reveal" role="status" data-reveal="5">
                Cita solicitada correctamente. Redirigiendo…
              </div>
            )}

            <p className="helper reveal" data-reveal="5">
              ¿Prefieres más tarde?{" "}
              <span className="textlink" onClick={() => navigate("/inicio")}>
                Volver al inicio
              </span>
            </p>
          </form>
        </div>

        <aside className="agendar__right reveal" data-reveal="2" aria-label="Preview de cita">
          <div className="preview-card">
            <PreviewCita form={form} />
          </div>
        </aside>
      </section>
    </main>
  );
}
