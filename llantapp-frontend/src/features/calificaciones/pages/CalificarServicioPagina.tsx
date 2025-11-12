import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalificarServicioModal } from '../componentes/CalificarServicioModal';

export default function CalificarServicioPagina() {
  const { citaId } = useParams<{ citaId: string }>();
  const navigate = useNavigate();
  const id = Number(citaId || 0);
  const token = undefined;

  if (!id || Number.isNaN(id)) {
    return (
      <main className="mcals">
        <div className="mcals__state mcals__state--error">
          Cita no válida.
        </div>
      </main>
    );
  }

  return (
    <CalificarServicioModal
      citaId={id}
      token={token}
      onClose={() => navigate(-1)}
    />
  );
}
