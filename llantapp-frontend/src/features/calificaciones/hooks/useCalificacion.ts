// src/features/calificaciones/hooks/useCalificacion.ts
import { useCallback, useEffect, useState } from 'react';
import { apiCalificaciones } from '../api';
import { Calificacion } from '../type';

export function useCalificacion(mantenimientoId: number, token?: string) {
  const [loading, setLoading] = useState(true);
  const [calif, setCalif] = useState<Calificacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCalificaciones.porMantenimiento(mantenimientoId, token);
      setCalif(data);
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status;
      if (status === 404) {
        setCalif(null); // aún no existe
      } else {
        setError(e?.message ?? 'No se pudo obtener la calificación');
      }
    } finally {
      setLoading(false);
    }
  }, [mantenimientoId, token]);

  useEffect(() => { fetcher(); }, [fetcher]);

  const crear = useCallback(async (estrellas: number, comentario?: string) => {
    if (estrellas < 1 || estrellas > 5) throw new Error('Selecciona entre 1 y 5 estrellas');
    await apiCalificaciones.crear({ mantenimientoId, estrellas, comentario }, token);
    await fetcher();
  }, [mantenimientoId, token, fetcher]);

  return { loading, calif, error, crear, refetch: fetcher };
}
