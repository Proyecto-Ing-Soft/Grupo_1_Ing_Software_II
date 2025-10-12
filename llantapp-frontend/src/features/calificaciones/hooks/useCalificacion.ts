import { useCallback, useEffect, useState } from 'react';
import { apiCalificaciones } from '../api';
import { Calificacion } from '../type';

export function useCalificacion(citaId: number, token?: string) {
  const [loading, setLoading] = useState(true);
  const [calif, setCalif] = useState<Calificacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetcher = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await apiCalificaciones.porCita(citaId, token);
      setCalif(data);                 // ← existe calificación
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status;
      if (status === 404) {
        setCalif(null);               // ← no existe aún: mostrar formulario
      } else {
        setError(e?.message ?? 'Error al cargar calificación');
      }
    } finally {
      setLoading(false);
    }
  }, [citaId, token]);

  useEffect(() => { fetcher(); }, [fetcher]);

  const crear = useCallback(async (estrellas: number, comentario?: string) => {
    if (estrellas < 1 || estrellas > 5) throw new Error('Selecciona entre 1 y 5 estrellas');
    await apiCalificaciones.crear({ citaId, estrellas, comentario }, token);
    await fetcher();                  // refresca y ahora sí existe
  }, [citaId, token, fetcher]);

  return { loading, calif, error, crear, refetch: fetcher };
}
