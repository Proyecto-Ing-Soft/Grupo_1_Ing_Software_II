import React, { useEffect, useMemo, useState } from 'react';
import { apiCalificaciones } from '../api';

export default function AdminCalificacionesPagina() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Filtros
  const [fMecanico, setFMecanico] = useState('');
  const [fEstrellas, setFEstrellas] = useState('');
  const [fPlaca, setFPlaca] = useState('');
  const [fDesde, setFDesde] = useState('');
  const [fHasta, setFHasta] = useState('');

  const cargar = async () => {
    setLoading(true); setErr(null);
    try {
      const list = await apiCalificaciones.adminList({
        page, pageSize,
        mecanicoId: fMecanico ? Number(fMecanico) : undefined,
        estrellas: fEstrellas ? Number(fEstrellas) : undefined,
        placa: fPlaca || undefined,
        desde: fDesde || undefined,
        hasta: fHasta || undefined,
      });
      setItems(list.items ?? []);
      setTotal(list.total ?? 0);

      const s = await apiCalificaciones.adminStats();
      setStats(s);
    } catch (e: any) {
      setErr(e?.message ?? 'Error al cargar calificaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, [page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const fmt = (s?: string) => (s ? new Date(s).toLocaleString() : '—');

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <h1 className="text-2xl font-semibold mb-2">Calificaciones (Admin)</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <input className="border rounded p-2" placeholder="ID Mecánico" value={fMecanico} onChange={e=>setFMecanico(e.target.value)} />
        <select className="border rounded p-2" value={fEstrellas} onChange={e=>setFEstrellas(e.target.value)}>
          <option value="">Estrellas</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input className="border rounded p-2" placeholder="Placa" value={fPlaca} onChange={e=>setFPlaca(e.target.value)} />
        <input type="date" className="border rounded p-2" value={fDesde} onChange={e=>setFDesde(e.target.value)} />
        <input type="date" className="border rounded p-2" value={fHasta} onChange={e=>setFHasta(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-4">
        <button className="px-3 py-2 border rounded" onClick={()=>{ setPage(1); cargar(); }}>Aplicar filtros</button>
        <button className="px-3 py-2 border rounded" onClick={()=>{
          setFMecanico(''); setFEstrellas(''); setFPlaca(''); setFDesde(''); setFHasta(''); setPage(1); cargar();
        }}>Limpiar</button>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-500">Promedio global</div>
            <div className="text-2xl font-semibold">{stats.promedioGlobal} ★</div>
            <div className="text-xs text-gray-500">{stats.totalCalificaciones} calificaciones</div>
          </div>
          <div className="border rounded p-3">
            <div className="font-medium mb-1">Distribución</div>
            <ul className="text-sm">
              {stats.distribucion.map((d: any) => (
                <li key={d.estrellas}>{d.estrellas}★ — {d.total}</li>
              ))}
            </ul>
          </div>
          <div className="border rounded p-3">
            <div className="font-medium mb-1">Top mecánicos</div>
            <ol className="text-sm list-decimal pl-5">
              {stats.promedioPorMecanico.slice(0,5).map((m: any) => (
                <li key={m.mecanicoId}>{m.nombre}: {m.promedio}★ ({m.n})</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Cita</th>
                <th className="p-2 text-left">Mecánico</th>
                <th className="p-2 text-left">Cliente</th>
                <th className="p-2 text-left">Placa</th>
                <th className="p-2 text-left">★</th>
                <th className="p-2 text-left">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{fmt(it.creadaEn)}</td>
                  <td className="p-2">#{it.citaId}</td>
                  <td className="p-2">{it.cita?.mecanico?.nombreCompleto ?? '—'}</td>
                  <td className="p-2">{it.cliente?.nombreCompleto ?? '—'}</td>
                  <td className="p-2">{it.cita?.placaPreliminar ?? '—'}</td>
                  <td className="p-2">{it.estrellas}</td>
                  <td className="p-2">{it.comentario ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      <div className="flex items-center justify-between pt-3">
        <button
          className="px-3 py-1 rounded border disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← Anterior
        </button>
        <div className="text-sm text-gray-600">
          Página {page} de {totalPages} · {total} registros
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
  );
}
