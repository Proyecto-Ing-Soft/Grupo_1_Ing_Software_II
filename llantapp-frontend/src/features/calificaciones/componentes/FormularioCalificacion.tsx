import React, { useState } from 'react';
import { Estrellas } from './Estrellas';

export const FormularioCalificacion: React.FC<{
  onSubmit: (estrellas: number, comentario?: string) => Promise<void> | void;
  disabled?: boolean;
}> = ({ onSubmit, disabled }) => {
  const [stars, setStars] = useState(0);
  const [comentario, setComentario] = useState('');
  const [sending, setSending] = useState(false);

  const enviar = async () => {
    if (stars < 1 || stars > 5) return alert('Selecciona entre 1 y 5 estrellas');
    try {
      setSending(true);
      await onSubmit(stars, comentario.trim() ? comentario : undefined);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm text-gray-400">Califica el servicio</label>
      <Estrellas value={stars} onChange={setStars} />
      <textarea
        placeholder="Comentario (opcional)"
        className="border rounded p-2 min-h-[100px] resize-y"
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        disabled={disabled || sending}
      />
      <button className="btn-primary" onClick={enviar} disabled={disabled || sending}>
        {sending ? 'Enviando…' : 'Enviar'}
      </button>
    </div>
  );
};
