import React, { useEffect, useState } from 'react';
import { apiCitas } from '../servicios/apiCitas';
import { useAuth } from '../app/proveedorestado/AuthContext';

export default function CitasMecanicoPagina() {
  const { sesion } = useAuth();
  const accessToken = sesion?.accessToken ?? undefined;

  const [citas, setCitas] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = async () => {
    try {
      setCargando(true);
      const data = await apiCitas.asignadas(accessToken);
      setCitas(data ?? []);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || 'Error cargando citas asignadas');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { recargar(); }, [accessToken]);

  const onAccion = async (id: number, accion: 'aceptar'|'iniciar'|'terminar') => {
    try {
      if (accion === 'aceptar') await apiCitas.aceptar(id, accessToken);
      if (accion === 'iniciar') await apiCitas.iniciar(id, accessToken);
      if (accion === 'terminar') await apiCitas.terminar(id, accessToken);
      recargar();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo actualizar la cita');
    }
  };

  if (cargando) return <p>Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  const fmtSoloFecha = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha';

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Citas asignadas</h1>
      <div className="grid gap-3">
        {citas.map((c) => (
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
              {c.estado === 'SOLICITADA' && (
                <button className="btn-primary" onClick={() => onAccion(c.id,'aceptar')}>Aceptar</button>
              )}
              {c.estado === 'ACEPTADA' && (
                <button className="btn-secondary" onClick={() => onAccion(c.id,'iniciar')}>Iniciar</button>
              )}
              {c.estado === 'EN_PROGRESO' && (
                <button className="btn-success" onClick={() => onAccion(c.id,'terminar')}>Terminar</button>
              )}
            </div>
          </div>
        ))}
        {citas.length === 0 && <p>No tienes citas pendientes.</p>}
      </div>
    </div>
  );
}
