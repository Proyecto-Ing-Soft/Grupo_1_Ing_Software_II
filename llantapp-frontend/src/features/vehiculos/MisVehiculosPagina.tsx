import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { apiVehiculos } from './api';
import './misVehiculos.css'; // Crearemos este archivo CSS

type VehiculoLite = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
};

export default function MisVehiculosPagina() {
  const { usuario } = useAuth();
  const [vehiculos, setVehiculos] = useState<VehiculoLite[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargando(true);
        setError(null);
        const data = await apiVehiculos.mios(usuario.token);
        if (alive) setVehiculos(data);
      } catch (err: any) {
        if (alive) setError(err.message || 'No se pudieron cargar los vehículos.');
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => { alive = false; };
  }, [usuario?.token]);

  if (cargando) {
    return <div className="vehiculos-loading">Cargando tus vehículos...</div>;
  }

  if (error) {
    return <div className="vehiculos-error">Error: {error}</div>;
  }

  return (
    <main className="mis-vehiculos">
      <header className="mis-vehiculos__header">
        <h1 className="mis-vehiculos__title">Mis Vehículos</h1>
        <p className="mis-vehiculos__sub">Selecciona un vehículo para ver su historial de servicios.</p>
      </header>

      {vehiculos.length === 0 ? (
        <p className="mis-vehiculos__empty">No tienes vehículos registrados a tu nombre.</p>
      ) : (
        <div className="mis-vehiculos__grid">
          {vehiculos.map((v) => (
            <Link key={v.id} to={`/vehiculos/${v.id}/historial`} className="vehiculo-card">
              <div className="vehiculo-card__icon">🚘</div>
              <div className="vehiculo-card__details">
                <span className="vehiculo-card__placa">{v.placa}</span>
                <span className="vehiculo-card__info">{v.marca} {v.modelo}</span>
              </div>
              <div className="vehiculo-card__cta">Ver Historial →</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}