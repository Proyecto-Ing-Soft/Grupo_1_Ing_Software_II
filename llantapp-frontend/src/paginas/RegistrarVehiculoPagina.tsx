// paginas/RegistrarVehiculoPagina.tsx
import React, { useState } from 'react';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { apiVehiculos } from '../servicios/apiVehiculos';
import { esquemaVehiculo, FormVehiculo } from '../validaciones/vehiculoEsquemas';

/**
 * SRP: página que registra vehículos.
 * KISS: formulario simple con estado local.
 * DRY: validaciones compartidas desde esquema zod.
 * YAGNI: no agregamos tabla/listado aquí; solo registro.
 */
export default function RegistrarVehiculoPagina() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormVehiculo>({
    placa: '',
    marca: '',
    modelo: '',
    anio: '2024' as unknown as number, // se normaliza en submit
    color: '',
    vin: '',
  } as any);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    // 1) Validación (front) — DRY con esquema zod
    const ver = esquemaVehiculo.safeParse(form);
    if (!ver.success) {
      setError(ver.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    // 2) Llamada a la Fachada
    if (!usuario?.token) {
      setError('No autenticado');
      return;
    }

    setCargando(true);
    try {
      const dto = ver.data;
      const res = await apiVehiculos.crear(
        {
          placa: dto.placa,
          marca: dto.marca,
          modelo: dto.modelo,
          anio: dto.anio as unknown as number, // ya viene como número tras transform
          color: dto.color,
          vin: dto.vin || undefined,
        },
        usuario.token
      );
      setOk(`Vehículo ${res.placa} creado correctamente`);
      setForm({ placa: '', marca: '', modelo: '', anio: '' as any, color: '', vin: '' } as any);
    } catch (err: any) {
      // Conflicto de placa o validación del backend
      setError(err?.message ?? 'No se pudo registrar el vehículo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2>Registrar vehículo</h2>
      <form onSubmit={enviar}>
        <div>
          <label>Placa</label>
          <input name="placa" value={form.placa} onChange={onChange} placeholder="ABC-123" />
        </div>
        <div>
          <label>Marca</label>
          <input name="marca" value={form.marca} onChange={onChange} placeholder="Toyota" />
        </div>
        <div>
          <label>Modelo</label>
          <input name="modelo" value={form.modelo} onChange={onChange} placeholder="Corolla" />
        </div>
        <div>
          <label>Año</label>
          <input name="anio" value={String(form.anio ?? '')} onChange={onChange} placeholder="2022" />
        </div>
        <div>
          <label>Color</label>
          <input name="color" value={form.color} onChange={onChange} placeholder="Rojo" />
        </div>
        <div>
          <label>VIN (opcional)</label>
          <input name="vin" value={form.vin ?? ''} onChange={onChange} placeholder="1HGCM82633A..." />
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Registrar'}
        </button>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {ok && <p style={{ color: 'green' }}>{ok}</p>}
      </form>

      {/* Comentarios de principios:
         - SRP: esta página solo registra vehículos.
         - OCP: si agregamos nuevos campos, extendemos esquema y UI sin romper lo demás.
         - DRY: validación en una sola fuente (esquemaVehiculo).
         - KISS: sin lógica innecesaria; solo submit + feedback.
         - YAGNI: no listamos ni editamos aquí; se hará en otro caso de uso.
      */}
    </div>
  );
}
