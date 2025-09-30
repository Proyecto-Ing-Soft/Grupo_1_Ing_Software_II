import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCitas } from '../servicios/apiCitas';

export default function MisCitasPagina() {
  const navigate = useNavigate();
  const [citas, setCitas] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        const data = await apiCitas.mias();
        setCitas(data ?? []);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || 'Error cargando tus citas');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <p>Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  const fmtSoloFecha = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha';

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis citas</h1>
        <button
          type="button"
          onClick={() => navigate('/inicio')}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          aria-label="Ir al inicio protegido"
          title="Ir al inicio"
        >
          ⬅️ Volver al inicio
        </button>
      </div>

      <div className="grid gap-3">
        {citas.map((c) => (
          <div key={c.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">#{c.id} – {c.tipo} – {c.vehiculo?.placa}</div>
              <div className="text-sm text-gray-600">
                {fmtSoloFecha(c.programadaPara)}
              </div>
              <div className="text-sm mt-1">{c.comentario}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-sm bg-gray-100">{c.estado}</span>
          </div>
        ))}

        {citas.length === 0 && (
          <div className="text-sm text-gray-700">
            <p>No tienes citas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
