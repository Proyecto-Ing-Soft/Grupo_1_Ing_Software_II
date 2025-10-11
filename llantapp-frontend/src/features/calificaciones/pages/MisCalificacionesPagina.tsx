// src/features/calificaciones/pages/MisCalificacionesPagina.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { apiCalificaciones } from '../api';
import { Calificacion } from '../type';
import { EstrellasCalificacion } from '../componentes/EstrellasCalificacion';

// (opcional) si tienes un context de auth, úsalo para pasar el token
// import { useAuth } from '../../../app/proveedorestado/AuthContext';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function MisCalificacionesPagina() {
  // const { token } = useAuth();
  const token = undefined; // pásalo desde tu contexto si aplica

  const [items, setItems] = useState<Calificacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const data = await apiCalificaciones.mias({ page, pageSize }, token);
        if (!mounted) return;
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? 'Error al cargar tus calificaciones');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, pageSize, token]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Mis calificaciones</h1>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && items.length === 0 && (
        <div className="p-4 rounded bg-gray-50 text-gray-600">
          Aún no has registrado calificaciones.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="border rounded-xl p-3 flex flex-col gap-2 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-800">Cita #{c.citaId}</span> · {formatDate(c.creadaEn)}
                </div>
                <EstrellasCalificacion value={c.estrellas} />
              </div>
              {c.comentario && (
                <p className="text-gray-700 whitespace-pre-line">{c.comentario}</p>
              )}
            </div>
          ))}

          {/* Paginación */}
          <div className="flex items-center justify-between pt-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ← Anterior
            </button>
            <div className="text-sm text-gray-600">
              Página {page} de {totalPages} · {total} calificación{total === 1 ? '' : 'es'}
            </div>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
