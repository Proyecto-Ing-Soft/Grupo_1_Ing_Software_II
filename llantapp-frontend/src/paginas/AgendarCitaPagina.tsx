import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCitas, TipoMantenimiento } from '../servicios/apiCitas';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { apiVehiculos } from '../servicios/apiVehiculos';
import { apiUsuarios } from '../servicios/apiUsuarios';

type Vehiculo = { id: number; placa: string; marca?: string; modelo?: string };
type UsuarioMin = { id: number; nombreCompleto: string };

const tipos: { value: TipoMantenimiento; label: string }[] = [
  { value: 'PREVENTIVO', label: 'Preventivo básico' },
  { value: 'CORRECTIVO', label: 'Correctivo común' },
  { value: 'LEGAL_ITV', label: 'Legal / ITV' },
  { value: 'EXTRAS', label: 'Extras y accesorios' },
];

export default function AgendarCitaPagina() {
  const { sesion } = useAuth();
  const accessToken = sesion?.accessToken ?? undefined;
  const navigate = useNavigate();

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mecanicos, setMecanicos] = useState<UsuarioMin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    tipo: 'PREVENTIVO' as TipoMantenimiento,
    vehiculoId: 0,
    mecanicoId: 0,
    programadaPara: '', // YYYY-MM-DD
    comentario: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setCargando(true);
        setErr(null);
        const [vs, ms] = await Promise.all([
          apiVehiculos.mios(accessToken),
          apiUsuarios.porRol('MECANICO', accessToken),
        ]);
        setVehiculos(vs ?? []);
        setMecanicos(ms ?? []);
        setForm((f) => ({
          ...f,
          vehiculoId: vs?.[0]?.id ?? 0,
          mecanicoId: ms?.[0]?.id ?? 0,
        }));
      } catch (e: any) {
        setErr(e?.message || 'Error cargando datos');
      } finally {
        setCargando(false);
      }
    })();
  }, [accessToken]);

  const sinVehiculo = useMemo(() => (vehiculos?.length ?? 0) === 0, [vehiculos]);
  const sinMecanico = useMemo(() => (mecanicos?.length ?? 0) === 0, [mecanicos]);
  const puedeEnviar = !sinVehiculo && !sinMecanico && form.comentario.trim().length >= 5;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!puedeEnviar) return;
      await apiCitas.crear(
        {
          tipo: form.tipo,
          vehiculoId: Number(form.vehiculoId),
          mecanicoId: Number(form.mecanicoId),
          programadaPara: form.programadaPara || undefined, // YYYY-MM-DD
          comentario: form.comentario.trim(),
        },
        accessToken
      );
      navigate('/citas/mias');
    } catch (e: any) {
      setErr(e?.message || 'Error creando la cita');
    }
  };

  if (cargando) return <p>Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Agendar cita</h1>
      {sinVehiculo && (
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          No tienes vehículos registrados. Registra uno antes de agendar una cita.
        </div>
      )}
      {sinMecanico && (
        <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
          No hay mecánicos disponibles por ahora.
        </div>
      )}

      <form className="grid gap-4" onSubmit={enviar}>
        <label className="grid gap-1">
          <span>Tipo de mantenimiento</span>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoMantenimiento })}
            className="border rounded p-2"
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span>Vehículo</span>
          <select
            value={form.vehiculoId}
            onChange={(e) => setForm({ ...form, vehiculoId: Number(e.target.value) })}
            className="border rounded p-2"
            disabled={sinVehiculo}
          >
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} {v.marca ?? ''} {v.modelo ?? ''}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span>Mecánico preferido</span>
          <select
            value={form.mecanicoId}
            onChange={(e) => setForm({ ...form, mecanicoId: Number(e.target.value) })}
            className="border rounded p-2"
            disabled={sinMecanico}
          >
            {mecanicos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombreCompleto}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span>Fecha (opcional)</span>
          <input
            type="date"
            value={form.programadaPara}
            onChange={(e) => setForm({ ...form, programadaPara: e.target.value })}
            className="border rounded p-2"
          />
        </label>

        <label className="grid gap-1">
          <span>Describe el problema</span>
          <textarea
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            rows={4}
            className="border rounded p-2"
            placeholder="Ej. vibraciones en frenos, pérdida de potencia, etc."
          />
          <small className="text-gray-500">
            Mínimo 5 caracteres. Actual: {form.comentario.trim().length}
          </small>
        </label>

        <button className="btn-primary" type="submit" disabled={!puedeEnviar}>
          Guardar cita
        </button>
      </form>
    </div>
  );
}
