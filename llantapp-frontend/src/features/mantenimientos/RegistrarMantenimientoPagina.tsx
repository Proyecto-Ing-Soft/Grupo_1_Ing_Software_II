import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas, TerminarCitaPayload } from "./api";
import { apiConsumibles, ConsumibleLite } from "../consumibles/api";
import "./registrarMantenimiento.css";

type ConsumoDetalle = {
  consumibleId: number;
  cantidad: number;
  etiqueta: string;
};

export default function RegistrarMantenimientoPagina() {
  const navigate = useNavigate();
  const { tieneRol } = useAuth();
  const { state } = useLocation() as { state?: { citaId?: number } };

  // citaId desde state o query ?cita=ID
  const citaId = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const byQuery = Number(q.get("cita") || "");
    return state?.citaId ?? (Number.isFinite(byQuery) ? byQuery : undefined);
  }, [state?.citaId]);

  // Guard de rol (solo mecánico)
  useEffect(() => {
    if (!tieneRol(["MECANICO"])) {
      navigate("/inicio", { replace: true });
    }
  }, [tieneRol, navigate]);

  // Form principal
  const [form, setForm] = useState<{
    trabajosRealizados: string;
    evidenciaBase64: string | null;
  }>({
    trabajosRealizados: "",
    evidenciaBase64: "" as string | null,
  });

  // Catálogo de consumibles y selección (US-20)
  const [catalogoConsumibles, setCatalogoConsumibles] = useState<ConsumibleLite[]>([]);
  const [cargandoConsumibles, setCargandoConsumibles] = useState(false);
  const [errorConsumibles, setErrorConsumibles] = useState<string | null>(null);

  const [repuestos, setRepuestos] = useState<string[]>([]);
  const [consumos, setConsumos] = useState<ConsumoDetalle[]>([]);
  const [consumibleSeleccionadoId, setConsumibleSeleccionadoId] = useState<number | "">("");
  const [cantidadConsumible, setCantidadConsumible] = useState<number>(1);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Cargar consumibles activos del catálogo
  useEffect(() => {
    (async () => {
      try {
        setCargandoConsumibles(true);
        setErrorConsumibles(null);
        const data = await apiConsumibles.listarActivosLite();
        setCatalogoConsumibles(data);
      } catch (e: any) {
        console.error("[REG-MANT] No se pudieron cargar consumibles", e);
        setErrorConsumibles("No se pudieron cargar los consumibles activos.");
      } finally {
        setCargandoConsumibles(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setForm((s) => ({ ...s, evidenciaBase64: "" }));
      return;
    }
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      setError("Formato no permitido");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setForm((s) => ({ ...s, evidenciaBase64: reader.result as string }));
    reader.onerror = () => setError("No se pudo leer la imagen");
    reader.readAsDataURL(f);
  };

  const validar = (): string | null => {
    if (!citaId) return "Cita inválida.";
    if (!form.trabajosRealizados.trim()) return "Describe los trabajos realizados.";
    return null;
  };

  // === Consumibles: agregar / quitar del array repuestos + consumos ===
  const agregarConsumible = () => {
    if (!consumibleSeleccionadoId || cantidadConsumible <= 0) return;

    const c = catalogoConsumibles.find((x) => x.id === consumibleSeleccionadoId);
    if (!c) return;

    // Sumar lo ya solicitado de este consumible
    const yaConsumido = consumos
      .filter((x) => x.consumibleId === c.id)
      .reduce((acc, x) => acc + x.cantidad, 0);

    const totalSolicitado = yaConsumido + cantidadConsumible;

    if (c.stockActual != null && totalSolicitado > c.stockActual) {
      setError(
        `No hay stock suficiente de "${c.nombre}". Disponible: ${c.stockActual}, solicitado: ${totalSolicitado}.`,
      );
      return;
    }

    const etiqueta = `${c.nombre} x ${cantidadConsumible} ${c.unidad}`.trim();

    // Mantener lista de repuestos (para resumen técnico)
    setRepuestos((prev) => (prev.includes(etiqueta) ? prev : [...prev, etiqueta]));

    // Mantener estructura de consumos (para backend)
    setConsumos((prev) =>
      prev.some(
        (item) =>
          item.consumibleId === c.id &&
          item.cantidad === cantidadConsumible &&
          item.etiqueta === etiqueta,
      )
        ? prev
        : [...prev, { consumibleId: c.id, cantidad: cantidadConsumible, etiqueta }],
    );

    // reset mini-form
    setConsumibleSeleccionadoId("");
    setCantidadConsumible(1);
    setError(null);
  };

  const quitarConsumible = (etiqueta: string) => {
    setRepuestos((prev) => prev.filter((r) => r !== etiqueta));
    setConsumos((prev) => prev.filter((c) => c.etiqueta !== etiqueta));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    const v = validar();
    if (v) {
      setError(v);
      return;
    }

    const payload: TerminarCitaPayload = {
      trabajosRealizados: form.trabajosRealizados.trim(),
      repuestos: repuestos.length ? repuestos : undefined,
      evidenciaBase64: form.evidenciaBase64 || undefined, // la fecha la pone el backend

      // US-20: enviar consumos estructurados para descontar stock en backend
      consumos:
        consumos.length > 0
          ? consumos.map(({ consumibleId, cantidad }) => ({
              consumibleId,
              cantidad,
            }))
          : undefined,
    };

    try {
      setEnviando(true);
      await apiCitas.registrarMantenimiento(citaId!, payload);
      setOk(true);
      setTimeout(
        () =>
          navigate("/inicio", {
            replace: true,
            state: {
              flash: {
                type: "success",
                text: `Mantenimiento de la cita #${citaId} registrado.`,
                ttlMs: 4000,
              },
            },
          }),
        900,
      );
    } catch (e: any) {
      setError(e?.message || "No se pudo registrar el mantenimiento");
    } finally {
      setEnviando(false);
    }
  };

  // Helper para obtener stock máximo del consumible seleccionado
  const maxCantidadSeleccionada = (() => {
    if (!consumibleSeleccionadoId) return undefined;
    const c = catalogoConsumibles.find((x) => x.id === consumibleSeleccionadoId);
    return c?.stockActual;
  })();

  return (
    <main className="registrar">
      <section className="registrar__split">
        <div className="registrar__left reveal">
          <h1 className="registrar__title">Registrar mantenimiento</h1>
          <p className="registrar__sub">
            La fecha se registrará automáticamente por el sistema.
          </p>

          {!citaId && (
            <div className="error-message" role="alert">
              No se recibió el ID de la cita. Vuelve desde la notificación.
            </div>
          )}

          <form className="form" onSubmit={enviar} noValidate>
            {/* Trabajos realizados */}
            <div className="form-group">
              <label className="label" htmlFor="trabajosRealizados">
                Trabajos realizados
              </label>
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

            {/* Consumibles utilizados (US-20) */}
            <div className="form-group">
              <label className="label">Consumibles utilizados</label>

              <div className="cons-row">
                <div className="input-wrap">
                  <select
                    className="input"
                    value={consumibleSeleccionadoId}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : "";
                      setConsumibleSeleccionadoId(value);
                      setCantidadConsumible(1);
                      setError(null);
                    }}
                    disabled={cargandoConsumibles || !!errorConsumibles}
                  >
                    <option value="">
                      {cargandoConsumibles
                        ? "Cargando consumibles…"
                        : "Selecciona un consumible…"}
                    </option>
                    {catalogoConsumibles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.unidad}){" "}
                        {typeof c.stockActual === "number"
                          ? `– Stock: ${c.stockActual}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-wrap cons-cantidad">
                  <input
                    type="number"
                    min={1}
                    max={maxCantidadSeleccionada}
                    className="input"
                    value={cantidadConsumible}
                    onChange={(e) => {
                      const raw = Number(e.target.value || "0");
                      if (!consumibleSeleccionadoId) {
                        setCantidadConsumible(
                          !Number.isFinite(raw) || raw <= 0 ? 1 : raw,
                        );
                        return;
                      }
                      const cSel = catalogoConsumibles.find(
                        (c) => c.id === consumibleSeleccionadoId,
                      );
                      const max = cSel?.stockActual ?? 1;
                      const safe = !Number.isFinite(raw)
                        ? 1
                        : Math.max(1, Math.min(raw, max));
                      setCantidadConsumible(safe);
                      setError(null);
                    }}
                    placeholder="Cantidad"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={agregarConsumible}
                  disabled={
                    !consumibleSeleccionadoId ||
                    cantidadConsumible <= 0 ||
                    !!errorConsumibles ||
                    cargandoConsumibles
                  }
                >
                  Añadir
                </button>
              </div>

              {errorConsumibles && (
                <div className="error-message mt4" role="alert">
                  {errorConsumibles}
                </div>
              )}

              {repuestos.length === 0 ? (
                <p className="helper">
                  Aún no has registrado consumibles para este mantenimiento.
                </p>
              ) : (
                <ul className="cons-list">
                  {repuestos.map((r) => (
                    <li key={r} className="cons-chip">
                      <span>{r}</span>
                      <button
                        type="button"
                        className="cons-chip__remove"
                        onClick={() => quitarConsumible(r)}
                        aria-label={`Quitar ${r}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Evidencia */}
            <div className="form-group">
              <label className="label" htmlFor="evidencia">
                Foto de evidencia (opcional)
              </label>
              <div className="input-wrap">
                <input
                  id="evidencia"
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                />
              </div>
              {form.evidenciaBase64 && (
                <div className="helper">Imagen seleccionada ✓</div>
              )}
            </div>

            <button type="submit" className="btn" disabled={enviando || !citaId}>
              {enviando ? "Guardando…" : "Guardar mantenimiento"}
            </button>

            {error && (
              <div className="error-message mt8" role="alert">
                {error}
              </div>
            )}
            {ok && (
              <div className="success-message mt8" role="status">
                Mantenimiento registrado.
              </div>
            )}
          </form>

          <p className="helper">
            ¿Quieres salir?{" "}
            <span className="textlink" onClick={() => navigate("/inicio")}>
              Volver al inicio
            </span>
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
