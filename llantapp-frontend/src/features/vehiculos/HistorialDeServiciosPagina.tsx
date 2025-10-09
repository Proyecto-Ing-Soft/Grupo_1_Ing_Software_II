import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { apiVehiculos } from './api';
import './historialDeServicios.css'; // Crearemos este archivo CSS

// Definimos los tipos de datos que esperamos de la API
type VehiculoInfo = { id: number; placa: string; marca: string; modelo: string };
type TrabajoRealizado = { id: number; tipo: string; fechaMantenimiento: string; trabajosRealizados: string | null; mecanico: { nombreCompleto: string } };
type ProximoServicio = { id: number; tipo: string; estado: string; programadaPara: string; comentario: string, mecanico: { nombreCompleto: string } | null };
type HistorialData = { vehiculo: VehiculoInfo; trabajosRealizados: TrabajoRealizado[]; proximosServicios: ProximoServicio[] };

// Helper para formatear fechas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
};

export default function HistorialDeServiciosPagina() {
  const { id } = useParams<{ id: string }>();
  const { usuario } = useAuth();
  const [data, setData] = useState<HistorialData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!usuario?.token || !id) return;
      try {
        setCargando(true);
        setError(null);
        const result = await apiVehiculos.historial(Number(id), usuario.token);
        if (alive) setData(result);
      } catch (err: any) {
        if (alive) setError(err.message || 'No se pudo cargar el historial.');
      } finally {
        if (alive) setCargando(false);
      }
    })();
    return () => { alive = false; };
  }, [usuario?.token, id]);

  if (cargando) {
    return <div className="historial-loading">Cargando historial del vehículo...</div>;
  }

  if (error) {
    return <div className="historial-error">Error: {error}</div>;
  }

  if (!data) {
    return <div className="historial-empty">No hay datos disponibles para este vehículo.</div>;
  }

  return (
    <main className="historial">
      <header className="historial__header">
        <p className="historial__breadcrumb"><Link to="/vehiculos/mios">Mis Vehículos</Link> / Historial</p>
        <h1 className="historial__title">Historial de <span className="historial__placa">{data.vehiculo.placa}</span></h1>
        <p className="historial__sub">{data.vehiculo.marca} {data.vehiculo.modelo}</p>
      </header>

      {/* Sección de Próximos Servicios */}
      <section className="historial-section">
        <h2 className="historial-section__title">🗓️ Próximos Mantenimientos</h2>
        {data.proximosServicios.length === 0 ? (
          <p className="historial-section__empty">No hay servicios programados.</p>
        ) : (
          <div className="timeline">
            {data.proximosServicios.map(s => (
              <div key={s.id} className="timeline-item timeline-item--proximo">
                <div className="timeline-item__date">{formatDate(s.programadaPara)}</div>
                <div className="timeline-item__content">
                  <h3 className="timeline-item__title">{s.tipo.replace('_', ' ')} <span className={`status-chip status--${s.estado.toLowerCase()}`}>{s.estado}</span></h3>
                  <p className="timeline-item__description">{s.comentario}</p>
                   {s.mecanico && <p className="timeline-item__meta">Mecánico: {s.mecanico.nombreCompleto}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección de Historial de Trabajos */}
      <section className="historial-section">
        <h2 className="historial-section__title">✅ Trabajos Realizados</h2>
        {data.trabajosRealizados.length === 0 ? (
          <p className="historial-section__empty">Aún no se han completado trabajos en este vehículo.</p>
        ) : (
          <div className="timeline">
            {data.trabajosRealizados.map(t => (
              <div key={t.id} className="timeline-item">
                <div className="timeline-item__date">{formatDate(t.fechaMantenimiento)}</div>
                <div className="timeline-item__content">
                  <h3 className="timeline-item__title">{t.tipo.replace('_', ' ')}</h3>
                  <p className="timeline-item__description">{t.trabajosRealizados || 'No se especificaron detalles del trabajo.'}</p>
                  <p className="timeline-item__meta">Atendido por: {t.mecanico.nombreCompleto}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}