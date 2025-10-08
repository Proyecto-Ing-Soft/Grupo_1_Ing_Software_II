import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../mantenimientos/asociarMecanico.css";

type Servicio = { id: number; nombre: string };
type Mecanico = { id: number; nombreCompleto: string };
type Elegible = Record<number, number[]>; // servicioId -> [mecanicoId]

export default function AsociarMecanicoServicioPagina() {
  const navigate = useNavigate();

  // MOCKS (conecta luego con tus APIs)
  const [servicios] = useState<Servicio[]>([
    { id: 1, nombre: "Mantenimiento preventivo" },
    { id: 2, nombre: "Alineación y balanceo" },
    { id: 3, nombre: "Revisión legal / ITV" },
  ]);
  const [mecanicos] = useState<Mecanico[]>([
    { id: 10, nombreCompleto: "Ana Torres" },
    { id: 11, nombreCompleto: "Luis Pérez" },
    { id: 12, nombreCompleto: "Marcos Díaz" },
  ]);
  const [vinculos, setVinculos] = useState<Elegible>({ 1: [10, 11], 2: [], 3: [12] });

  const [servSel, setServSel] = useState<number>(1);
  const [q, setQ] = useState("");
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Animación reveal
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        (e.target as HTMLElement).classList.toggle("animate-in", e.isIntersecting);
      }
    }, { threshold: 0.12 });

    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });

    return () => {
      window.clearTimeout(t);
      nodes.forEach(n => obs.unobserve(n));
      obs.disconnect();
    };
  }, [servSel]);

  const elegidos = useMemo(() => new Set(vinculos[servSel] ?? []), [vinculos, servSel]);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? mecanicos.filter(m => m.nombreCompleto.toLowerCase().includes(s)) : mecanicos;
  }, [q, mecanicos]);

  const toggleMecanico = (id: number) => {
    setOkMsg(null);
    setVinculos(prev => {
      const cur = new Set(prev[servSel] ?? []);
      cur.has(id) ? cur.delete(id) : cur.add(id);
      return { ...prev, [servSel]: Array.from(cur) };
    });
  };

  const guardar = () => {
    // TODO: apiServicios.setElegibles(servSel, Array.from(elegidos))
    setOkMsg("Mecánicos habilitados actualizados.");
  };

  return (
    <main className="ams">
      <section className="agendar__left reveal" data-reveal="1">
        <header className="ams__head">
          <h1 className="agendar__title">Asociar mecánico al servicio</h1>
          <p className="agendar__sub">Define qué mecánicos están habilitados para cada servicio.</p>

          <div className="ams__toolbar">
            <button type="button" className="btn btn--ghost" onClick={() => navigate("/inicio")}>
              <span aria-hidden>⬅️</span>&nbsp;Volver al inicio
            </button>
          </div>
        </header>

        {/* Selección de servicio */}
        <form className="form reveal" data-reveal="2" onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label className="label" htmlFor="servicio">Servicio</label>
            <div className="input-wrap">
              <select
                id="servicio"
                className="input"
                value={servSel}
                onChange={(e) => setServSel(Number(e.target.value))}
              >
                {servicios.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscador mecánicos */}
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="label" htmlFor="buscar">Mecánicos</label>
            <div className="input-wrap">
              <input
                id="buscar"
                className="input"
                placeholder="Buscar…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </form>

        {/* Cuerpo: listado de chips + seleccionados */}
        <div className="ams__split reveal" data-reveal="3">
          <section aria-label="Listado de mecánicos" className="ams__box">
            <div className="chips">
              {filtrados.map((m) => {
                const on = elegidos.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`chip ${on ? "on" : ""}`}
                    title={on ? "Quitar de habilitados" : "Habilitar para el servicio"}
                    onClick={() => toggleMecanico(m.id)}
                  >
                    <span className="chip__dot" aria-hidden />
                    <span>{m.nombreCompleto}</span>
                  </button>
                );
              })}
              {filtrados.length === 0 && (
                <div className="helper">No se encontraron coincidencias.</div>
              )}
            </div>
          </section>

          <aside aria-label="Habilitados" className="ams__box">
            <h3 className="ams__boxTitle">Habilitados para el servicio</h3>

            {elegidos.size === 0 ? (
              <div className="helper">Ningún mecánico habilitado aún.</div>
            ) : (
              <ul className="selList" role="list">
                {Array.from(elegidos).map(id => {
                  const m = mecanicos.find(x => x.id === id)!;
                  return (
                    <li key={id} role="listitem" className="selRow">
                      <span className="pill">
                        <span className="pill__dot" />
                        {m.nombreCompleto}
                      </span>
                      <button
                        type="button"
                        className="iconBtn"
                        aria-label={`Quitar a ${m.nombreCompleto}`}
                        title="Quitar"
                        onClick={() => toggleMecanico(id)}
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="actions">
              <button type="button" className="btn" onClick={guardar}>
                💾 Guardar cambios
              </button>
            </div>

            {okMsg && <div className="success-message mt8">{okMsg}</div>}
          </aside>
        </div>
      </section>
    </main>
  );
}
