
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiCitas } from "../mantenimientos/api";
import { apiUsuarios } from "./api";
import "./asociarMecanico.css";
import noResultadosImg from "../../assets/priv/cliente/no-resultados.png";

type TipoMantenimientoFE = "PREVENTIVO" | "CORRECTIVO" | "LEGAL_ITV" | "EXTRAS";
type EstadoCitaFE = "SOLICITADA" | "EN_PROGRESO" | "TERMINADA";

interface CitaRow {
  id: number;
  tipo: TipoMantenimientoFE;
  estado: EstadoCitaFE;
  programadaPara?: string | null;
  vehiculo?: { placa: string } | null; // Opción A: Vehículo registrado
  placaPreliminar?: string | null;     // Opción B: Texto manual
  clienteId: number;
  mecanicoId?: number | null;
  //Nuevo
  mecanico?: {                // El objeto completo (para leer el nombre o ID)
      id: number; 
      nombreCompleto: string 
  } | null;

}
interface MecanicoRow {
  id: number;
  nombreCompleto: string;
}

export default function AdminCitasPendientes() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [mecanicos, setMecanicos] = useState<MecanicoRow[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [q, setQ] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);
  // NUEVO: Para saber qué ID de cita estamos modificando actualmente
  const [editandoId, setEditandoId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [cs, ms] = await Promise.all([
        apiCitas.pendientesAdmin(),
        apiUsuarios.listarPorRol("MECANICO"),
      ]);
      if (!alive) return;
      setCitas(cs);
      setMecanicos(ms);
    })();
    return () => { alive = false; };
  }, []);

  // Animaciones de entrada (reveal)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e =>
        (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting)
      ),
      { threshold: 0.12 }
    );
    nodes.forEach((n, i) => { n.dataset.reveal = String(Math.min(i + 1, 5)); obs.observe(n); });
    return () => { window.clearTimeout(t); nodes.forEach(n => obs.unobserve(n)); obs.disconnect(); };
  }, [citas.length]);

  const fmtFechaCorta = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "—";

  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();
    // 1. Primero filtramos las que NO sean TERMINADA
    // (Esto es útil si tu backend decide mandar historial también)
    const activas = citas.filter(c => c.estado !== "TERMINADA");

    if (!s) return activas;

    // 2. Luego aplicamos el buscador sobre las activas
    return activas.filter(c =>
      String(c.id).includes(s) ||
      c.tipo.toLowerCase().includes(s) ||
      (c.vehiculo?.placa ?? "").toLowerCase().includes(s) ||
      c.estado.toLowerCase().includes(s)
    );
  }, [q, citas]);

  const asignar = async (citaId: number) => {
    const mecId = seleccion[citaId];
    const citaActual = citas.find(c => c.id === citaId);
    const idFinal = mecId || citaActual?.mecanicoId || citaActual?.mecanico?.id;
    //if (!mecId) return alert("Selecciona un mecánico");
    if (!idFinal) return alert("Selecciona un mecánico");
    
    setOkMsg(null);
    await apiCitas.asignar(citaId, mecId);

    // CAMBIO AQUÍ: Usamos map en vez de filter
    setCitas(prev => prev.map(cita => {
      if (cita.id === citaId) {
        return { 
          ...cita, 
          // Marcamos que ya tiene mecánico (esto nos sirve para bloquear el botón)
          mecanicoId: mecId,
          // Opcional: Cambiamos el estado visualmente si tu backend lo hace
          estado: "EN_PROGRESO" 
        }; 
      }
      return cita;
    }));

    setOkMsg(`Cita #${citaId} asignada correctamente.`);
  };

  return (
    <main className="ams ams-scope">
      <section className="agendar__left reveal" data-reveal="1">
        <header className="ams__head">
          <h1 className="agendar__title">Citas pendientes</h1>
          <p className="agendar__sub">
            Asigna un mecánico a cada solicitud de mantenimiento.
          </p>
          <div className="ams__toolbar">
            {/* Botón igual al de Admin Calificaciones */}
            <button
              type="button"
              className="mc-btn mc-btn--gradient"
              onClick={() => navigate("/inicio")}
              title="Volver al inicio"
            >
              <span className="mc-icon" aria-hidden>⬅️</span>
              <span className="mc-btn__text">Volver al inicio</span>
            </button>
          </div>
        </header>

        <form className="form reveal" data-reveal="2" onSubmit={e => e.preventDefault()}>
          <div className="form-group form-group--full">
            <label className="label" htmlFor="buscar">Buscar</label>
            <div className="input-wrap">
              <input
                id="buscar"
                className="input"
                placeholder="Placa, tipo, estado o #ID…"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>
          </div>
        </form>

        {filtradas.length === 0 ? (
          <div className="ams__box reveal" data-reveal="3" role="status">
            <div className="helper">No hay citas pendientes que coincidan con tu búsqueda.</div>
            <img
              src={noResultadosImg}
              alt="Sin resultados para tu búsqueda de citas pendientes"
              className="ams__emptyImg"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="ams__split reveal" data-reveal="3">
            {filtradas.map(c => {
              // CORRECCIÓN: Lógica explícita y limpia
              const yaAsignada = c.mecanicoId != null || c.estado === "EN_PROGRESO";
              
              // ¿La estamos editando AHORA MISMO?
              const esModoEdicion = editandoId === c.id;

              // Lógica de bloqueo
              const bloqueado = yaAsignada && !esModoEdicion;

              return (
                <article key={c.id} className="ams__box" aria-label={`Cita #${c.id}`}>
                  {/* ... resto del componente igual ... */}
                  <header className="box__meta">
                    <span className="pill"><span className="pill__dot" />#{c.id}</span>
                    <span className="pill">{c.tipo.replace("_", " ")}</span>
                    <span className="pill">{c.estado.replace("_", " ")}</span>
                  </header>

                  <div className="selList">
                    <div className="selRow"><strong>Placa</strong><span>{c.vehiculo?.placa || c.placaPreliminar || "—"}</span></div>
                    <div className="selRow"><strong>Fecha</strong><span>{fmtFechaCorta(c.programadaPara)}</span></div>
                  </div>

                  <div className="form form--one">
                    <div className="form-group">
                      <label className="label" htmlFor={`mec-${c.id}`}>Mecánico</label>
                      <div className="input-wrap">
                        <select
                          id={`mec-${c.id}`}
                          className="input"
                          disabled={bloqueado}
                          value={seleccion[c.id] || c.mecanicoId || c.mecanico?.id || ""}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setSeleccion(s => ({ ...s, [c.id]: (val || undefined) as any }));
                          }}
                        >
                          <option value="">Asignar…</option>
                          {mecanicos.map(m => (
                            <option key={m.id} value={m.id}>{m.nombreCompleto}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="actions" style={{ gap: '8px' }}>
                    {/* Botón MODIFICAR si ya está asignada */}
                    {yaAsignada && !esModoEdicion && (
                      <button
                        type="button"
                        className="btn"
                        style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', boxShadow: 'none' }}
                        onClick={() => setEditandoId(c.id)}
                      >
                        ✏️ Modificar
                      </button>
                    )}

                    {/* Botón CANCELAR si estamos editando */}
                    {esModoEdicion && (
                      <button
                        type="button"
                        className="btn"
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', boxShadow: 'none', padding: '10px 14px' }}
                        onClick={() => {
                             setEditandoId(null);
                             setSeleccion(s => { const copy = {...s}; delete copy[c.id]; return copy; });
                        }} 
                        title="Cancelar cambios"
                      >
                        ✕
                      </button>
                    )}

                    {/* Botón GUARDAR/ASIGNAR */}
                    {(!yaAsignada || esModoEdicion) && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => asignar(c.id)}
                        title={esModoEdicion ? "Guardar nuevo mecánico" : "Asignar mecánico"}
                      >
                        {esModoEdicion ? "💾 Guardar" : "🧰 Asignar"}
                      </button>
                    )}
                    
                    {/* Etiqueta Visual */}
                    {yaAsignada && !esModoEdicion && (
                         <span style={{ display: 'flex', alignItems: 'center', color: '#059669', fontWeight: 'bold', fontSize: '14px', marginLeft: '4px' }}>
                             ✅ Asignado
                         </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {okMsg && <div className="success-message mt8" role="alert">{okMsg}</div>}
      </section>
    </main>
  );
}
