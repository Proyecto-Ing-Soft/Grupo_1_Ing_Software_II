// src/paginas/RegistrarMantenimientoPagina.tsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/proveedorestado/AuthContext";
import { apiCitas, TerminarCitaPayload } from "../servicios/apiCitas";
import "../estilos/registrarVehiculo.css"; // reutilizamos el estilo bonito

export default function RegistrarMantenimientoPagina() {
  const navigate = useNavigate();
  const { usuario, tieneRol } = useAuth();
  const { state } = useLocation() as { state?: { citaId?: number } };

  // citaId desde state o query ?cita=ID
  const citaId = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const byQuery = Number(q.get("cita") || "");
    return state?.citaId ?? (Number.isFinite(byQuery) ? byQuery : undefined);
  }, [state?.citaId]);

  // guard (ajusta si quieres permitir otros)
  if (!tieneRol(["MECANICO"])) {
    navigate("/inicio", { replace: true });
  }

  const [form, setForm] = useState({
    trabajosRealizados: "",
    repuestos: "",                 // texto separado por comas
    evidenciaBase64: "" as string | null, // opcional
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) { setForm(s => ({ ...s, evidenciaBase64: "" })); return; }
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) { setError("Formato no permitido"); return; }
    if (f.size > 5 * 1024 * 1024) { setError("La imagen no debe superar 5MB"); return; }

    const reader = new FileReader();
    reader.onload = () => setForm(s => ({ ...s, evidenciaBase64: reader.result as string }));
    reader.onerror = () => setError("No se pudo leer la imagen");
    reader.readAsDataURL(f);
  };

  const validar = (): string | null => {
    if (!citaId) return "Cita inválida.";
    if (!form.trabajosRealizados.trim()) return "Describe los trabajos realizados.";
    return null;
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setOk(false);
    const v = validar();
    if (v) { setError(v); return; }

    const payload: TerminarCitaPayload = {
      trabajosRealizados: form.trabajosRealizados.trim(),
      repuestos: form.repuestos
        ? form.repuestos.split(",").map(s => s.trim()).filter(Boolean)
        : undefined,
      evidenciaBase64: form.evidenciaBase64 || undefined, // la fecha la pone el backend
    };

    try {
      setEnviando(true);
      await apiCitas.registrarMantenimiento(citaId!, payload);
      setOk(true);
      setTimeout(() => navigate("/inicio", {
        replace: true,
        state: { flash: { type: "success", text: `Mantenimiento de la cita #${citaId} registrado.`, ttlMs: 4000 } }
      }), 900);
    } catch (e: any) {
      setError(e?.message || "No se pudo registrar el mantenimiento");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="registrar">
      <section className="registrar__split">
        <div className="registrar__left reveal">
          <h1 className="registrar__title">Registrar mantenimiento</h1>
          <p className="registrar__sub">La fecha se registrará automáticamente por el sistema.</p>

          {!citaId && (
            <div className="error-message" role="alert">
              No se recibió el ID de la cita. Vuelve desde la notificación.
            </div>
          )}

          <form className="form" onSubmit={enviar} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="trabajosRealizados">Trabajos realizados</label>
              <div className="input-wrap">
                <textarea
                  id="trabajosRealizados"
                  name="trabajosRealizados"
                  className="input"
                  rows={5}
                  placeholder="Diagnóstico, reparaciones, pruebas realizadas…"
                  value={form.trabajosRealizados}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="repuestos">Repuestos utilizados (separados por coma)</label>
              <div className="input-wrap">
                <input
                  id="repuestos"
                  name="repuestos"
                  className="input"
                  placeholder="Filtro de aceite, Pastillas de freno, ..."
                  value={form.repuestos}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="evidencia">Foto de evidencia (opcional)</label>
              <div className="input-wrap">
                <input id="evidencia" type="file" accept="image/*" onChange={onPickFile} />
              </div>
              {form.evidenciaBase64 && (
                <div className="helper">Imagen seleccionada ✓</div>
              )}
            </div>

            <button type="submit" className="btn" disabled={enviando || !citaId}>
              {enviando ? "Guardando…" : "Guardar mantenimiento"}
            </button>

            {error && <div className="error-message mt8" role="alert">{error}</div>}
            {ok && <div className="success-message mt8" role="status">Mantenimiento registrado.</div>}
          </form>

          <p className="helper">
            ¿Quieres salir?{" "}
            <span className="textlink" onClick={() => navigate("/inicio")}>Volver al inicio</span>
          </p>
        </div>

        <aside className="registrar__right reveal" aria-hidden="true">
          <div className="registrar__hero">
            <h2 className="registrar__heroTitle">Evidencias y detalle</h2>
            <div className="registrar__heroPill">
              <span aria-hidden>🛠️</span>
              <span>Deja rastros claros del servicio</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
