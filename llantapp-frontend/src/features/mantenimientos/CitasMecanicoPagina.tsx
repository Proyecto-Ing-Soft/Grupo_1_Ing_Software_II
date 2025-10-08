import React, { useEffect, useState } from 'react';
import { apiCitas } from '../servicios/apiCitas';

export default function CitasMecanicoPagina() {
  const [citas, setCitas] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = async () => {
    try {
      setCargando(true);
      const data = await apiCitas.asignadas();
      setCitas(data ?? []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || 'Error cargando citas asignadas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { recargar(); }, []);

  const onTerminar = async (id: number) => {
    try {
      await apiCitas.terminar(id);
      await recargar();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo terminar la cita');
    }
  };

  if (cargando) return <p>Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  const fmtSoloFecha = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha';

  const hoyYMD = new Date().toISOString().slice(0,10);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Citas asignadas</h1>
      <div className="grid gap-3">
        {citas.map((c) => {
          const programada = c.programadaPara ? new Date(c.programadaPara).toISOString().slice(0,10) : null;
          const puedeTerminar = c.estado === 'EN_PROGRESO' && programada === hoyYMD;

          return (
            <div key={c.id} className="border rounded p-3">
              <div className="flex justify-between items-center">
                <div className="font-medium">#{c.id} – {c.tipo} – {c.vehiculo?.placa}</div>
                <span className="text-sm">{c.estado}</span>
              </div>
              <div className="text-sm text-gray-600">
                Cliente: {c.cliente?.nombreCompleto ?? '—'} / Fecha: {fmtSoloFecha(c.programadaPara)}
              </div>
              <p className="text-sm mt-2">{c.comentario}</p>

              <div className="flex gap-2 mt-3">
                <button
                  className={`px-3 py-1 rounded ${puedeTerminar ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  disabled={!puedeTerminar}
                  onClick={() => onTerminar(c.id)}
                  title={puedeTerminar ? 'Terminar mantenimiento' : 'Solo puede terminarse el día programado'}
                >
                  TERMINAR
                </button>
              </div>
            </div>
          );
        })}
        {citas.length === 0 && <p>No tienes citas asignadas.</p>}
      </div>
    </div>
  );
}
