import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalificacion } from '../hooks/useCalificacion';
import { FormularioCalificacion } from '../componentes/FormularioCalificacion';
import { EstrellasCalificacion } from '../componentes/EstrellasCalificacion';

export default function CalificarServicioPagina() {
  const { citaId } = useParams<{ citaId: string }>();
  const navigate = useNavigate();
  const id = Number(citaId);
  const token = undefined; // toma del contexto de auth si lo usas

  const { loading, calif, crear, error } = useCalificacion(id, token);

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Calificar servicio</h1>

      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !calif && <FormularioCalificacion onSubmit={async (e,c) => { await crear(e,c); navigate(-1); }} />}

      {!loading && calif && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Esta cita ya fue calificada:</p>
          <EstrellasCalificacion value={calif.estrellas} />
          {calif.comentario && <p className="mt-2 p-2 bg-gray-50 rounded">{calif.comentario}</p>}
        </div>
      )}
    </div>
  );
}
