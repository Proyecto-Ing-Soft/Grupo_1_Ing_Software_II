import React, { useEffect, useMemo, useState } from 'react';
import { useCalificacion } from '../hooks/useCalificacion';
import { EstrellasCalificacion } from './EstrellasCalificacion';
import { FormularioCalificacion } from './FormularioCalificacion';
import { descargarEvidenciaCita, obtenerDetalleCita } from '../../mantenimientos/api';
import '../calificarServicio.css';

type Media = { url: string; mime: string };

export const CalificarServicioModal: React.FC<{
  citaId: number;
  token?: string;
  onClose?: () => void;
}> = ({ citaId, token, onClose }) => {
  const { loading, calif, crear, error } = useCalificacion(citaId, token);

  const [detLoading, setDetLoading] = useState(true);
  const [trabajos, setTrabajos] = useState<string | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [detErr, setDetErr] = useState<string | null>(null);

  // Cargar detalle y evidencia para mostrar aunque NO haya calificación aún.
  useEffect(() => {
    let alive = true;
    (async () => {
      setDetLoading(true); setDetErr(null);
      try {
        // 1) detalle (contiene trabajosRealizados)
        const det = await obtenerDetalleCita(citaId, token);
        if (!alive) return;
        setTrabajos(det?.trabajosRealizados ?? null);

        // 2) evidencia (si hay)
        try {
          const ev = await descargarEvidenciaCita(citaId, token);
          if (!alive) return;
          setMedia({ url: ev.url, mime: ev.mime });
        } catch {
          // sin evidencia, no es error fatal
          setMedia(null);
        }
      } catch (e: any) {
        if (!alive) return;
        setDetErr(e?.message ?? 'No se pudo cargar la información del servicio');
      } finally {
        if (alive) setDetLoading(false);
      }
    })();
    return () => {
      alive = false;
      // limpia el objectURL si lo creamos
      if (media?.url) URL.revokeObjectURL(media.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citaId, token]);

  const isVideo = useMemo(() => !!media?.mime?.startsWith('video/'), [media?.mime]);

  return (
    <div className="calificar-servicio-overlay">
      <div className="calificar-servicio-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-calificar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 id="titulo-calificar" style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Calificar servicio</h3>
          <button onClick={onClose} aria-label="Cerrar" className="btn-cancelar">✕</button>
        </div>

        {/* Estado de carga/errores (detalle/evidencia) */}
        {detLoading && <p className="texto-aux">Cargando evidencia y detalle…</p>}
        {detErr && <p className="mensaje-calificacion">{detErr}</p>}

        {/* Evidencia del servicio */}
        {!detLoading && (media || trabajos) && (
          <div className="evidencia">
            {media && (
              isVideo ? (
                <video className="evidencia-media" src={media.url} controls playsInline/>
              ) : (
                <img className="evidencia-media" src={media.url} alt="Evidencia del servicio" />
              )
            )}
            {trabajos && (
              <div className="evidencia-descripcion">
                <div className="evidencia-titulo">Descripción del servicio</div>
                <p className="evidencia-texto">{trabajos}</p>
              </div>
            )}
          </div>
        )}

        {/* Estado de carga/errores (calificación) */}
        {loading && <p className="texto-aux">Cargando calificación…</p>}
        {error && <p className="mensaje-calificacion">{error}</p>}

        {/* Si aún no existe calificación ⇒ mostrar formulario debajo de la evidencia */}
        {!loading && !calif && (
          <FormularioCalificacion onSubmit={crear} onCancel={onClose} />
        )}

        {/* Si ya calificó ⇒ mostrar resumen */}
        {!loading && calif && (
          <div>
            <div className="texto-aux">Ya calificaste esta cita:</div>
            <div className="bloque-estrellas">
              <EstrellasCalificacion value={calif.estrellas} />
            </div>
            {calif.comentario && (
              <p className="mensaje-calificacion">{calif.comentario}</p>
            )}
            <div className="acciones-calificar">
              <button type="button" className="btn-enviar" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
