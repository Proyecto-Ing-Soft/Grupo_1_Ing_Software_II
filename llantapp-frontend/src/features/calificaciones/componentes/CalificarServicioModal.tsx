import React from 'react';
import { useCalificacion } from '../hooks/useCalificacion';
import { EstrellasCalificacion } from './EstrellasCalificacion';
import { FormularioCalificacion } from './FormularioCalificacion';

export const CalificarServicioModal: React.FC<{
  citaId: number;
  token?: string;
  onClose?: () => void;
}> = ({ citaId, token, onClose }) => {
  const { loading, calif, crear, error } = useCalificacion(citaId, token);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Calificar servicio</h3>
          <button onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {loading && <p>Cargando…</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !calif && (
          <FormularioCalificacion onSubmit={crear} />
        )}

        {!loading && calif && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Ya calificaste esta cita:</p>
            <EstrellasCalificacion value={calif.estrellas} />
            {calif.comentario && (
              <p className="mt-2 p-2 bg-gray-50 rounded">{calif.comentario}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
