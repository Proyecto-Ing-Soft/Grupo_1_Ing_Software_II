import React, { useState } from 'react';
import { Estrellas } from './Estrellas';

export const FormularioCalificacion: React.FC<{
  onSubmit: (estrellas: number, comentario?: string) => Promise<void> | void;
  disabled?: boolean;
  onCancel?: () => void;
}> = ({ onSubmit, disabled, onCancel }) => {
  const [stars, setStars] = useState(0);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);
  const max = 300;

  const enviar = async () => {
    if (stars < 1 || stars > 5) return;
    try {
      setSending(true);
      await onSubmit(stars, comentario.trim() ? comentario.slice(0, max) : undefined);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="texto-aux">Califica el servicio</div>
      <div className="bloque-estrellas">
        <Estrellas value={stars} onChange={setStars} />
        <div className="leyenda-estrellas">{stars > 0 ? `${stars} ${stars === 1 ? 'estrella' : 'estrellas'}` : ''}</div>
      </div>

      <label className="label">Comentario (opcional)</label>
      <textarea
        placeholder="Escribe tu comentario"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        disabled={disabled || sending}
      />
      <div className="contador-resena">{comentario.length}/{max}</div>

      <div className="acciones-calificar">
        <button type="button" className="btn-cancelar" onClick={onCancel} disabled={disabled || sending}>Cancelar</button>
        <button type="button" className="btn-enviar" onClick={enviar} disabled={disabled || sending}>{sending ? 'Enviando…' : 'Enviar'}</button>
      </div>
    </div>
  );
};
