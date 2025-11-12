import React, { useEffect, useMemo, useState } from 'react';
import { EstrellasCalificacion } from './EstrellasCalificacion';
import { FormularioCalificacion } from './FormularioCalificacion';
import { apiCalificaciones } from '../api';
import { apiMedia } from '../mediaApi';
import '../calificarServicio.css';

type Media = { url: string; mime: string };

type CalificacionDetalle = {
  calificacionId?: number;
  citaId: number;
  clienteUsuarioId: number;
  estrellas?: number;
  comentario?: string | null;
  visible?: boolean;
  fechaCreacion?: string | Date;
};

export const CalificarServicioModal: React.FC<{
  citaId: number;
  token?: string;
  onClose?: () => void;
}> = ({ citaId, token, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [calif, setCalif] = useState<CalificacionDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [detLoading, setDetLoading] = useState(true);
  const [trabajos, setTrabajos] = useState<string | null>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const [detErr, setDetErr] = useState<string | null>(null);

  const [creando, setCreando] = useState(false);

  useEffect(() => {
    let alive = true;

    const cargar = async () => {
      setLoading(true);
      setError(null);
      setDetLoading(true);
      setDetErr(null);

      try {
        try {
          const detalle = await apiCalificaciones.leerPorCita(citaId, token);
          if (!alive) return;

          const normalizada: CalificacionDetalle = {
            calificacionId:
              detalle.calificacionId ??
              detalle.calificacion_id ??
              detalle.id,
            citaId:
              detalle.citaId ??
              detalle.cita_id ??
              citaId,
            clienteUsuarioId:
              detalle.clienteUsuarioId ??
              detalle.cliente_usuario_id,
            estrellas:
              detalle.puntuacion ??
              detalle.estrellas,
            comentario: detalle.comentario ?? null,
            visible:
              typeof detalle.visible === 'boolean'
                ? detalle.visible
                : true,
            fechaCreacion:
              detalle.fechaCreacion ??
              detalle.fecha_creacion,
          };

          if (normalizada.estrellas && normalizada.calificacionId) {
            setCalif(normalizada);
          } else {
            setCalif(null);
          }
        } catch (e: any) {
          const status = e?.status ?? e?.response?.status;
          if (status === 404) {
            setCalif(null);
          } else {
            setError(
              e?.message ??
                'No se pudo obtener la calificación de la cita'
            );
          }
        }

        try {
          const evid = await apiMedia.porCita(citaId, token);
          if (!alive) return;

          const desc =
            evid.descripcion ??
            evid.descripcion_trabajos ??
            evid.trabajosRealizados ??
            null;
          setTrabajos(desc);

          const first = evid.media?.[0];
          if (first?.url) {
            const url = first.url;
            const lower = url.toLowerCase();
            const mime = /(\.mp4|\.webm|\.ogg)$/i.test(lower)
              ? 'video/*'
              : 'image/*';
            setMedia({ url, mime });
          } else {
            setMedia(null);
          }
        } catch (e: any) {
          setMedia(null);
          setDetErr(
            e?.message ??
              'No se pudo cargar la evidencia de la cita'
          );
        }
      } finally {
        if (alive) {
          setLoading(false);
          setDetLoading(false);
        }
      }
    };

    cargar();

    return () => {
      alive = false;
    };
  }, [citaId, token]);

  const isVideo = useMemo(
    () => !!media?.mime?.startsWith('video/'),
    [media?.mime]
  );

  const crear = async (estrellas: number, comentario?: string) => {
    if (creando) return;
    if (estrellas < 1 || estrellas > 5) {
      setError('Selecciona entre 1 y 5 estrellas');
      return;
    }

    setCreando(true);
    setError(null);

    try {
      const creada = await apiCalificaciones.crear(
        { citaId, estrellas, comentario },
        token
      );

      const normalizada: CalificacionDetalle = {
        calificacionId:
          creada.calificacionId ??
          creada.calificacion_id ??
          creada.id,
        citaId:
          creada.citaId ??
          creada.cita_id ??
          citaId,
        clienteUsuarioId:
          creada.clienteUsuarioId ??
          creada.cliente_usuario_id ??
          creada.clienteId ??
          creada.cliente,
        estrellas:
          creada.puntuacion ??
          creada.estrellas,
        comentario: creada.comentario ?? null,
        visible:
          typeof creada.visible === 'boolean'
            ? creada.visible
            : true,
        fechaCreacion:
          creada.fechaCreacion ??
          creada.fecha_creacion,
      };

      if (normalizada.estrellas && normalizada.calificacionId) {
        setCalif(normalizada);
      }
    } catch (e: any) {
      setError(
        e?.message ??
          'No se pudo registrar la calificación de la cita'
      );
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="calificar-servicio-overlay">
      <div
        className="calificar-servicio-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-calificar"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h3
            id="titulo-calificar"
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Calificar cita
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="btn-cancelar"
          >
            ✕
          </button>
        </div>

        {detLoading && (
          <p className="texto-aux">
            Cargando información de la cita…
          </p>
        )}
        {detErr && (
          <p className="mensaje-calificacion">
            {detErr}
          </p>
        )}

        {!detLoading && (media || trabajos) && (
          <div className="evidencia">
            {media &&
              (isVideo ? (
                <video
                  className="evidencia-media"
                  src={media.url}
                  controls
                  playsInline
                />
              ) : (
                <img
                  className="evidencia-media"
                  src={media.url}
                  alt="Evidencia de la cita"
                />
              ))}
            {trabajos && (
              <div className="evidencia-descripcion">
                <div className="evidencia-titulo">
                  Descripción del servicio realizado
                </div>
                <p className="evidencia-texto">
                  {trabajos}
                </p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <p className="texto-aux">
            Verificando si ya calificaste esta cita…
          </p>
        )}
        {error && (
          <p className="mensaje-calificacion">
            {error}
          </p>
        )}

        {!loading && !calif && (
          <FormularioCalificacion
            onSubmit={crear}
            onCancel={onClose}
            disabled={creando}
          />
        )}

        {!loading && calif && calif.estrellas && (
          <div>
            <div className="texto-aux">
              Ya calificaste esta cita:
            </div>
            <div className="bloque-estrellas">
              <EstrellasCalificacion
                value={calif.estrellas}
              />
            </div>
            {calif.comentario && (
              <p className="mensaje-calificacion">
                {calif.comentario}
              </p>
            )}
            <div className="acciones-calificar">
              <button
                type="button"
                className="btn-enviar"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
