import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { descargarEvidenciaCita } from '../mantenimientos/api';
import { apiHistorial, HistorialData, ProximoServicio, TrabajoRealizado } from './api';

import './historialDeServicios.css';

// Helper robusto para fechas (tolera null/invalid)
const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Sin fecha programada';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Para mostrar "humano" (PREVENTIVO -> Preventivo, EN_PROGRESO -> En progreso)
const labelize = (s: string) =>
  s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

function TrabajoItemConEvidencia({ item }: { item: TrabajoRealizado }) {
  const [media, setMedia] = useState<{ url: string; mime: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isVideo = media?.mime?.startsWith('video/');

  const verEvidencia = async () => {
    if (media || loading) return;
    try {
      setLoading(true);
      setErr(null);
      const ev = await descargarEvidenciaCita(item.id);
      setMedia({ url: ev.url, mime: ev.mime });
    } catch (e: any) {
      setErr(e?.message ?? 'No se pudo cargar la evidencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => () => {
      if (media?.url) URL.revokeObjectURL(media.url);
    },
    [media?.url],
  );

  const fmt = (s?: string | null) =>
    s ? new Date(s).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha';

  return (
    <div className="timeline-item">
      <div className="timeline-item__date">{fmt(item.fechaMantenimiento)}</div>
      <div className="timeline-item__content">
        <h3 className="timeline-item__title">{labelize(item.tipo)}</h3>
        <p className="timeline-item__description">
          {item.trabajosRealizados || 'No se especificaron detalles del trabajo.'}
        </p>
        <p className="timeline-item__meta">
          Atendido por: {item.mecanico?.nombreCompleto ?? '—'}
        </p>

        {item.evidenciaDisponible && !media && (
          <button
            className="btnGhost"
            onClick={verEvidencia}
            disabled={loading}
            type="button"
          >
            {loading ? 'Cargando evidencia…' : 'Ver evidencia'}
          </button>
        )}
        {err && (
          <div className="historial-error" role="alert" style={{ padding: 8 }}>
            {err}
          </div>
        )}

        {media && (
          <div style={{ marginTop: 8 }}>
            {isVideo ? (
              <video src={media.url} controls className="evidencia-media" />
            ) : (
              <img src={media.url} alt="Evidencia" className="evidencia-media" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HistorialDeServiciosPagina() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();

  const [data, setData] = useState<HistorialData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug global opcional
  (window as any).debugHistorial = {
    get data() {
      return data;
    },
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      console.log('[HIST] effect start', {
        id,
        tieneToken: !!usuario?.token,
        tokenPreview: usuario?.token?.slice?.(0, 12),
      });
      if (!id || !usuario?.token) {
        console.log('[HIST] skip fetch: faltan id o token');
        return;
      }
      try {
        setCargando(true);
        setError(null);

        console.log('[HIST] fetching /historial/vehiculo/:id', {
          vehiculoId: Number(id),
        });
        const result = await apiHistorial.porVehiculo(Number(id), usuario.token);

        // Logs de contenido
        console.log('[HIST] result recibido', result);
        console.log('[HIST] counts', {
          proximosServicios: result?.proximosServicios?.length ?? -1,
          trabajosRealizados: result?.trabajosRealizados?.length ?? -1,
        });

        if (alive) setData(result);
      } catch (err: any) {
        // soporta errores en texto plano o json->message
        let msg = 'No se pudo cargar el historial.';
        try {
          if (err instanceof Response) {
            const txt = await err.clone().text();
            try {
              msg = JSON.parse(txt)?.message || txt || msg;
            } catch {
              msg = txt || msg;
            }
            console.error('[HIST] HTTP error', {
              status: err.status,
              msg,
              rawText: txt,
            });
          } else if (err?.message) {
            msg = err.message;
            console.error('[HIST] Error', err);
          } else {
            console.error('[HIST] Error desconocido', err);
          }
        } catch (parseErr) {
          console.error('[HIST] Error parseando error', parseErr);
        }
        if (alive) setError(msg);
      } finally {
        if (alive) {
          setCargando(false);
          console.log('[HIST] effect end');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [usuario?.token, id]);

  console.log('[HIST] render', {
    cargando,
    tieneData: !!data,
    tieneError: !!error,
    prox: data?.proximosServicios?.length ?? 0,
    trab: data?.trabajosRealizados?.length ?? 0,
  });

  if (cargando) {
    return <div className="historial-loading">Cargando historial del vehículo...</div>;
  }

  if (error) {
    return <div className="historial-error">Error: {error}</div>;
  }

  if (!data) {
    return <div className="historial-empty">No hay datos disponibles para este vehículo.</div>;
  }

  return (
    <main className="historial">
      <header className="historial__header">
        <p className="historial__breadcrumb">
          <Link to="/vehiculos/mios">Mis Vehículos</Link> / Historial
        </p>
        <h1 className="historial__title">
          Historial de{' '}
          <span className="historial__placa">{data.vehiculo.placa}</span>
        </h1>
        <p className="historial__sub">
          {data.vehiculo.marca} {data.vehiculo.modelo}
        </p>

        {id && (
          <div className="historial__actions">
            <Link
              to={`/vehiculos/${id}/intervenciones-externas`}
              className="historial__btn-externa"
            >
              ➕ Registrar intervención externa
            </Link>
          </div>
        )}
      </header>

      {/* Próximos Servicios */}
      <section className="historial-section">
        <h2 className="historial-section__title">🗓️ Próximos Mantenimientos</h2>
        {(data.proximosServicios?.length ?? 0) === 0 ? (
          <>
            {console.log('[HIST] UI: no hay proximosServicios')}
            <p className="historial-section__empty">No hay servicios programados.</p>
          </>
        ) : (
          <div className="timeline">
            {data.proximosServicios.map((s: ProximoServicio) => (
              <div
                key={s.id}
                className="timeline-item timeline-item--proximo"
              >
                <div className="timeline-item__date">
                  {formatDate(s.programadaPara)}
                </div>
                <div className="timeline-item__content">
                  <h3 className="timeline-item__title">
                    {labelize(s.tipo)}{' '}
                    <span
                      className={`status-chip status--${s.estado.toLowerCase()}`}
                    >
                      {labelize(s.estado)}
                    </span>
                  </h3>
                  <p className="timeline-item__description">
                    {s.comentario || 'Sin comentarios.'}
                  </p>
                  {s.mecanico && (
                    <p className="timeline-item__meta">
                      Mecánico: {s.mecanico.nombreCompleto}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trabajos Realizados */}
      <section className="historial-section">
        <h2 className="historial-section__title">✅ Trabajos Realizados</h2>
        {(data.trabajosRealizados?.length ?? 0) === 0 ? (
          <>
            {console.log('[HIST] UI: no hay trabajosRealizados')}
            <p className="historial-section__empty">
              Aún no se han completado trabajos en este vehículo.
            </p>
          </>
        ) : (
          <div className="timeline">
            {data.trabajosRealizados.map((t: TrabajoRealizado) => (
              <TrabajoItemConEvidencia key={t.id} item={t} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
