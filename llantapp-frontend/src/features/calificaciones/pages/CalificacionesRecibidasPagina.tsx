import React, { useEffect, useMemo, useState } from 'react';
import { apiCalificaciones } from '../api';
import { EstrellasCalificacion } from '../componentes/EstrellasCalificacion';

type Item = {
  id: number;
  citaId: number;
  clienteId: number;
  estrellas: number;
  comentario?: string | null;
  creadaEn: string;
  // del backend (include):
  cita?: {
    id: number;
    estado: string;
    fechaMantenimiento?: string | null;
    placaPreliminar?: string | null;
    marcaPreliminar?: string | null;
    modeloPreliminar?: string | null;
  } | null;
  cliente?: { id: number; nombreCompleto: string } | null;
};

function fmtFecha(s?: string | null) {
  return s ? new Date(s).toLocaleString() : '—';
}

export default function CalificacionesRecibidasPagina() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await apiCalificaciones.recibidas({ page, pageSize });
        if (!alive) return;
        setItems(res.items ?? []);
        setTotal(res.total ?? 0);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? 'Error al cargar calificaciones recibidas');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Calificaciones recibidas</h1>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && items.length === 0 && (
        <div className="p-4 rounded bg-gray-50 text-gray-600">
          Aún no has recibido calificaciones.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="border rounded-xl p-3 flex flex-col gap-2 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Cita #{it.citaId}</span>
                  {it.cita?.placaPreliminar && <> · Placa {it.cita.placaPreliminar}</>}
                  {it.cita?.fechaMantenimiento && <> · {fmtFecha(it.cita.fechaMantenimiento)}</>}
                  {it.cliente?.nombreCompleto && <> · Cliente: {it.cliente.nombreCompleto}</>}
                </div>
                <EstrellasCalificacion value={it.estrellas} />
              </div>
              {it.comentario && (
                <p className="text-gray-700 whitespace-pre-line">{it.comentario}</p>
              )}
              <div className="text-xs text-gray-500">Recibida: {fmtFecha(it.creadaEn)}</div>
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
