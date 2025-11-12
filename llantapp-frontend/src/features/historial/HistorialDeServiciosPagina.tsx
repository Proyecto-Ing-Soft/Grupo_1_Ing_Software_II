// [Ruta del archivo: src/features/historial/HistorialDeServiciosPagina.tsx]
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
// ADVERTENCIA: Asumo que tu API de 'citas' se actualizó para reflejar la nueva
// lógica de 'mantenimiento'. La evidencia ahora cuelga del 'mantenimiento_id'.
import { descargarEvidenciaMantenimiento } from '../citas/api'; // <--- CAMBIO DE NOMBRE
import { apiHistorial, HistorialData, ProximoServicio, TrabajoRealizado } from './api';
import './historialDeServicios.css';

// Helper robusto para fechas (tolera null/invalid)
const formatDate = (dateString?: string | null) => {
 if (!dateString) return 'Sin fecha programada';
 const d = new Date(dateString);
 if (isNaN(d.getTime())) return 'Fecha inválida';
 return d.toLocaleDateString('es-PE', {
   year: 'numeric', month: 'long', day: 'numeric'
 });
};

// Para mostrar "humano" (PREVENTIVO -> Preventivo, EN_PROGRESO -> En progreso)
const labelize = (s: string) =>
 s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());

/**
* Principio: Componente de Presentación (Dumb Component)
* Este componente solo recibe props (item) y las renderiza.
* No sabe de dónde vino 'item', solo confía en su "contrato" (el tipo TrabajoRealizado).
*/
function TrabajoItemConEvidencia({ item }: { item: TrabajoRealizado }) {
 const [media, setMedia] = useState<{ url: string; mime: string } | null>(null);
 const [loading, setLoading] = useState(false);
 const [err, setErr] = useState<string | null>(null);

 const isVideo = media?.mime?.startsWith('video/');

 const verEvidencia = async () => {
   if (media || loading) return;
   try {
     setLoading(true); setErr(null);
     // ADAPTACIÓN: La evidencia se pide por 'mantenimiento_id', que es 'item.id'
     const ev = await descargarEvidenciaMantenimiento(item.id);
     setMedia({ url: ev.url, mime: ev.mime });
   } catch (e: any) {
     setErr(e?.message ?? 'No se pudo cargar la evidencia');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => () => { if (media?.url) URL.revokeObjectURL(media.url); }, [media?.url]);

 const formatDate = (s?: string | null) =>
   s ? new Date(s).toLocaleDateString('es-PE', { dateStyle: 'medium' }) : 'Sin fecha';

 return (
   <div className="timeline-item">
     {/* ADAPTACIÓN: De 'fechaMantenimiento' a 'fecha_fin' */}
     <div className="timeline-item__date">{formatDate(item.fecha_fin)}</div>
     <div className="timeline-item__content">
       <h3 className="timeline-item__title">{item.tipo}</h3>
       <p className="timeline-item__description">
         {/* ADAPTACIÓN: De 'trabajosRealizados' a 'descripcion_trabajos' */}
         {item.descripcion_trabajos || 'No se especificaron detalles del trabajo.'}
       </p>
       {/* ADAPTACIÓN: 'mecanico' ahora es un string, no un objeto */}
       <p className="timeline-item__meta">Atendido por: {item.mecanico ?? '—'}</p>

       {/* ADAPTACIÓN: De 'evidenciaDisponible' a 'tiene_evidencia' */}
       {item.tiene_evidencia && !media && (
         <button className="btnGhost" onClick={verEvidencia} disabled={loading} type="button">
           {loading ? 'Cargando evidencia…' : 'Ver evidencia'}
         </button>
       )}
       {err && <div className="historial-error" role="alert" style={{ padding: 8 }}>{err}</div>}

       {media && (
         <div style={{ marginTop: 8 }}>
           {isVideo ? (
             <video src={media.url} controls className="evidencia-media" />
           ) : (
             <img src={media.url} alt="Evidencia" className="evidencia-media" />
           )}
         </div>
       )}
     </div>
   </div>
 );
}

export default function HistorialDeServiciosPagina() {
 const { id } = useParams<{ id: string }>();
 const { usuario } = useAuth();

 const [data, setData] = useState<HistorialData | null>(null);
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState<string | null>(null);

 (window as any).debugHistorial = { get data() { return data; } };

 // Principio: Hook de Efecto (Carga de datos)
 // Este useEffect tiene la responsabilidad (SRP) de cargar los datos
 // del historial, manejar el estado de carga y los errores.
 // Es "agnóstico" a la forma de los datos, solo llama a 'apiHistorial'.
 useEffect(() => {
   let alive = true;
   (async () => {
     if (!id || !usuario?.token) {
       return;
     }
     try {
       setCargando(true);
       setError(null);

       // La 'api.ts' ya hace la traducción, aquí solo consumimos
       const result = await apiHistorial.porVehiculo(Number(id), usuario.token);

       if (alive) setData(result);
     } catch (err: any) {
       let msg = 'No se pudo cargar el historial.';
       try {
         if (err instanceof Response) {
           const txt = await err.clone().text();
           try { msg = (JSON.parse(txt)?.message) || txt || msg; }
           catch { msg = txt || msg; }
         } else if (err?.message) {
           msg = err.message;
         }
       } catch (parseErr) {
         // Silencio
       }
       if (alive) setError(msg);
     } finally {
       if (alive) {
         setCargando(false);
       }
     }
   })();
   return () => { alive = false; };
 }, [usuario?.token, id]);

is (cargando) {
   return <div className="historial-loading">Cargando historial del vehículo...</div>;
 }

 if (error) {
   return <div className="historial-error">Error: {error}</div>;
 }

 if (!data) {
   return <div className="historial-empty">No hay datos disponibles para este vehículo.</div>;
'}

 // Los console.log se han omitido por brevedad
 return (
   <main className="historial">
     <header className="historial__header">
       <p className="historial__breadcrumb">
         <Link to="/vehiculos/mios">Mis Vehículos</Link> / Historial
       </p>
       <h1 className="historial__title">
         Historial de <span className="historial__placa">{data.vehiculo.placa}</span>
       </h1>
       <p className="historial__sub">{data.vehiculo.marca} {data.vehiculo.modelo}</p>
     </header>

     {/* Próximos Servicios */}
     <section className="historial-section">
       <h2 className="historial-section__title">🗓️ Próximos Mantenimientos</h2>
       {(data.proximosServicios?.length ?? 0) === 0 ? (
         <p className="historial-section__empty">No hay servicios programados.</p>
       ) : (
         <div className="timeline">
           {data.proximosServicios.map((s: ProximoServicio) => (
             <div key={s.id} className="timeline-item timeline-item--proximo">
               {/* ADAPTACIÓN: De 'programadaPara' a 'fecha_programada' */}
               <div className="timeline-item__date">{formatDate(s.fecha_programada)}</div>
               <div className="timeline-item__content">
                 <h3 className="timeline-item__title">
                   {labelize(s.tipo)}{' '}
                   <span className={`status-chip status--${s.estado.toLowerCase()}`}>{labelize(s.estado)}</span>
                 </h3>
                 {/* ADAPTACIÓN: De 'comentario' a 'comentarios_cliente' */}
                 <p className="timeline-item__description">{s.comentarios_cliente || 'Sin comentarios.'}</p>
                 {/* ADAPTACIÓN: 'mecanico' ahora es un string, no un objeto */}
                {s.mecanico && <p className="timeline-item__meta">Mecánico: {s.mecanico}</p>}
               </div>
             </div>
           ))}
         </div>
       )}
     </section>

     {/* Trabajos Realizados */}
     <section className="historial-section">
       <h2 className="historial-section__title">✅ Trabajos Realizados</h2>
       {(data.trabajosRealizados?.length ?? 0) === 0 ? (
         <p className="historial-section__empty">Aún no se han completado trabajos en este vehículo.</p>
       ) : (
         <div className="timeline">
      s    {/* Este map funciona porque 'TrabajoItemConEvidencia' fue actualizado */}
           {data.trabajosRealizados.map((t: TrabajoRealizado) => (
             <TrabajoItemConEvidencia key={t.id} item={t} />
           ))}
         </div>
      }
     </section>
   </main>
 );
}