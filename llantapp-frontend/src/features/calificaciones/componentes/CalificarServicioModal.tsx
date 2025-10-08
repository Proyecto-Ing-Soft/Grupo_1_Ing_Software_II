import { useMemo, useState } from "react";
import "./calificarServicio.css";
import EstrellasCalificacion from"./EstrellasCalificacion"
import { useAuth } from "../../app/proveedorestado/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

// DTO que enviaremos al backend
export type CalificacionCrearDTO = {
  citaId: number;
  estrellas: number;     // 1..5
  resena?: string;       // texto opcional (se guarda como TEXT en BD)
};

interface CalificarServicioModalProps {
  abierto: boolean;
  citaId: number;
  onCerrar: () => void;
  onCalificacionEnviada?: () => void;
  maxCaracteresResena?: number; // por defecto 800
}

export default function CalificarServicioModal({
  abierto,
  citaId,
  onCerrar,
  onCalificacionEnviada,
  maxCaracteresResena = 800,
}: CalificarServicioModalProps) {
  const { usuario } = useAuth();
  const [puntuacion, setPuntuacion] = useState(0);
  const [resena, setResena] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const restantes = useMemo(
    () => maxCaracteresResena - resena.length,
    [resena.length, maxCaracteresResena]
  );

  if (!abierto) return null;

  const enviarCalificacion = async () => {
    const body: CalificacionCrearDTO = {
      citaId,
      estrellas: puntuacion,
      resena: resena.trim() || undefined,
    };

    // Validaciones mínimas en FE
    if (body.estrellas < 1 || body.estrellas > 5) {
      setMensaje("Selecciona una calificación entre 1 y 5 ⭐.");
      return;
    }
    if (body.resena && body.resena.length > maxCaracteresResena) {
      setMensaje(`La reseña supera el límite de ${maxCaracteresResena} caracteres.`);
      return;
    }

    setEnviando(true);
    setMensaje(null);

    try {
      const resp = await fetch(`${API_BASE}/calificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(usuario?.token ? { Authorization: `Bearer ${usuario.token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || "Error al enviar la calificación");
      }

      setMensaje("✅ ¡Gracias por calificar y dejar tu reseña!");
      setTimeout(() => {
        onCalificacionEnviada?.();
        onCerrar();
        setPuntuacion(0);
        setResena("");
        setMensaje(null);
      }, 1000);
    } catch (e: any) {
      setMensaje(e?.message ?? "No se pudo enviar la calificación");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="calificar-servicio-overlay"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-calificar-servicio"
    >
      <div className="calificar-servicio-modal">
        <h2 id="titulo-calificar-servicio">Calificar Servicio</h2>

        <p className="texto-aux">
          Califica de 1 a 5 estrellas y deja una reseña opcional sobre tu experiencia.
        </p>

        <div className="bloque-estrellas">
          <EstrellasCalificacion
            valor={puntuacion}
            onCambiar={setPuntuacion}
            tamano={32}
            ariaLabel="Calificación de servicio (1 a 5 estrellas)"
          />
          <div className="leyenda-estrellas">
            {puntuacion === 0 && "Selecciona tu calificación"}
            {puntuacion === 1 && "Muy insatisfecho"}
            {puntuacion === 2 && "Insatisfecho"}
            {puntuacion === 3 && "Neutral"}
            {puntuacion === 4 && "Satisfecho"}
            {puntuacion === 5 && "Muy satisfecho"}
          </div>
        </div>

        <label className="label" htmlFor="resena">
          Reseña (opcional)
        </label>
        <textarea
          id="resena"
          placeholder="Cuéntanos brevemente tu experiencia…"
          value={resena}
          onChange={(e) => setResena(e.target.value)}
          rows={4}
          maxLength={maxCaracteresResena}
          aria-describedby="contador-resena"
        />
        <div id="contador-resena" className="contador-resena">
          {restantes} caracteres restantes
        </div>

        {mensaje && <p className="mensaje-calificacion">{mensaje}</p>}

        <div className="acciones-calificar">
          <button onClick={onCerrar} className="btn-cancelar" disabled={enviando}>
            Cancelar
          </button>
          <button
            onClick={enviarCalificacion}
            className="btn-enviar"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar Calificación"}
          </button>
        </div>
      </div>
    </div>
  );
}
