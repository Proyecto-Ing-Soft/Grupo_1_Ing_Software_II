// src/paginas/AgendarCitaPagina.tsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { esquemaCita, type CitaForm } from "../validaciones/citaSchemas";
import { apiCitas } from "../servicios/apiCitas";

// PRINCIPIOS:
// - SRP: render + validación + submit de "agendar cita".
// - KISS: estado mínimo, mensajes claros.
// - Demeter: llama a apiCitas (fachada), sin tocar fetch/directo.

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
      setFormErr(Object.values(fe)[0] ?? "Datos inválidos");
      return;
    }

    try {
      setEnviando(true);
      const payload = parsed.data;
      await apiCitas.crear({
        ...payload,
        // normalizamos algunos campos opcionales a undefined
        colorPreliminar: payload.colorPreliminar || undefined,
        vinPreliminar: payload.vinPreliminar || undefined,
        comentario: payload.comentario || undefined,
      });

      setOk(true);
      // Redirige como en Registro: breve delay + mensaje flash en Inicio
      timeoutRef.current = window.setTimeout(() => {
        navigate("/inicio", {
          replace: true,
          state: {
            flash: {
              type: "success",
              text: "Cita solicitada: quedará en PENDIENTE hasta asignación.",
              ttlMs: 4000,
            },
          },
        });
      }, REDIRECT_DELAY);
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "No se pudo registrar la cita");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-split" role="region" aria-label="Formulario de cita">
        {/* Izquierda: Form (reusa tus estilos de auth) */}
        <div className="auth-left">
          <h1 className="brand">Solicitar cita</h1>
          <p className="sub">Ingresa los datos del vehículo y la fecha programada.</p>

          <form className="form" onSubmit={enviar} noValidate>
            {/* Tipo */}
            <div className="form-group">
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

            {/* Placa */}
            <div className="form-group">
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

            {/* Marca */}
            <div className="form-group">
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

            {/* Modelo */}
            <div className="form-group">
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

            {/* Año (opcional) */}
            <div className="form-group">
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

            {/* Color (opcional) */}
            <div className="form-group">
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

            {/* VIN (opcional) */}
            <div className="form-group">
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

            {/* Fecha */}
            <div className="form-group">
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

            {/* Comentario */}
            <div className="form-group">
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

            <button type="submit" className="btn" disabled={enviando}>
              {enviando ? "Enviando…" : "Solicitar cita"}
            </button>

            {formErr && (
              <div className="error-message" style={{ marginTop: 8 }} role="alert">
                {formErr}
              </div>
            )}

            {ok && (
              <div className="success-message" style={{ marginTop: 8 }} role="status">
                Cita solicitada correctamente. Redirigiendo…
              </div>
            )}
          </form>

          <p className="helper">
            ¿Prefieres más tarde? <span className="textlink" onClick={() => navigate("/inicio")}>Volver al inicio</span>
          </p>
        </div>

        {/* Derecha: puedes poner una imagen/hero como en registro, si quieres */}
        <aside className="auth-right" aria-hidden="true">
          <div className="auth-right-inner">
            <h2 className="hero-title">Servicio rápido y confiable</h2>
            <div className="hero-pill">
              <span className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
              <span>Agenda tu mantenimiento en minutos</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
