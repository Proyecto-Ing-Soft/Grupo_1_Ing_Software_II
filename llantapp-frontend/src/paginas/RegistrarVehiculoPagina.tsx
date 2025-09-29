// paginas/RegistrarVehiculoPagina.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { apiVehiculos } from '../servicios/apiVehiculos';
import { esquemaVehiculo, FormVehiculo } from '../validaciones/vehiculoEsquemas';
import "../estilos/registrarVehiculo.css";

export default function RegistrarVehiculoPagina() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const HOME_PATH = '/inicio';            // va hacia inicio
  const REDIRECT_DELAY = 1200;      // milisegundos (1.2s)
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
  return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);
  
  const [form, setForm] = useState<FormVehiculo>({
    placa: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    color: '',
    vin: '',
  } as any);

  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'anio' || type === 'number' ? Number(value) : value,
    }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    const ver = esquemaVehiculo.safeParse(form);
    if (!ver.success) {
      setError(ver.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

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
          anio: Number(dto.anio),
          color: dto.color,
          vin: dto.vin || undefined,
        },
        usuario.token
      );
      setOk(`Vehículo ${res.placa} creado correctamente`);
      setForm({
        placa: '',
        marca: '',
        modelo: '',
        anio: '' as any,
        color: '',
        vin: '',
      } as any);
      timeoutRef.current = window.setTimeout(() => {
        navigate(HOME_PATH, { replace: true });
      }, REDIRECT_DELAY);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo registrar el vehículo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rv__container">
      <header className="rv__header">
        <div>
          <h1 className="rv__title">Registrar vehículo</h1>
          <p className="rv__subtitle">
            Completa los datos. El propietario se tomará del usuario autenticado.
          </p>
        </div>
      </header>

      <section className="rv__card">
        <form className="rv__form" onSubmit={enviar}>
          <div className="rv__grid">
            <div className="rv__group rv__col-4">
              <label htmlFor="placa" className="rv__label">Placa</label>
              <input
                id="placa"
                name="placa"
                className="rv__input"
                value={form.placa}
                onChange={onChange}
                placeholder="ABC-123"
                required
              />
            </div>

            <div className="rv__group rv__col-4">
              <label htmlFor="marca" className="rv__label">Marca</label>
              <input
                id="marca"
                name="marca"
                className="rv__input"
                value={form.marca}
                onChange={onChange}
                placeholder="Toyota"
                required
              />
            </div>

            <div className="rv__group rv__col-4">
              <label htmlFor="modelo" className="rv__label">Modelo</label>
              <input
                id="modelo"
                name="modelo"
                className="rv__input"
                value={form.modelo}
                onChange={onChange}
                placeholder="Corolla"
                required
              />
            </div>

            <div className="rv__group rv__col-3">
              <label htmlFor="anio" className="rv__label">Año</label>
              <input
                id="anio"
                name="anio"
                type="number"
                className="rv__input"
                min={1950}
                max={new Date().getFullYear() + 1}
                value={String(form.anio ?? '')}
                onChange={onChange}
                placeholder="2022"
                required
              />
            </div>

            <div className="rv__group rv__col-3">
              <label htmlFor="color" className="rv__label">Color</label>
              <input
                id="color"
                name="color"
                className="rv__input"
                value={form.color}
                onChange={onChange}
                placeholder="Rojo"
                required
              />
            </div>

            <div className="rv__group rv__col-6">
              <label htmlFor="vin" className="rv__label">VIN (opcional)</label>
              <input
                id="vin"
                name="vin"
                className="rv__input"
                value={form.vin ?? ''}
                onChange={onChange}
                placeholder="1HGCM82633A..."
              />
            </div>
          </div>

          {error && <div className="rv__error">{error}</div>}
          {ok && <div className="rv__success">{ok}</div>}

          {cargando ? (
            <div className="rv__loading">Registrando vehículo…</div>
          ) : (
            <div className="rv__row">
              <button className="rv__btn" type="submit" disabled={cargando}>
                Registrar
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
