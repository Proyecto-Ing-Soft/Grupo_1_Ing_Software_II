// src/paginas/NotificacionesTallerPagina.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../servicios/apiNotificacion";
import { useAuth } from "../app/proveedorestado/AuthContext";
import type { NotificacionDTO } from "../tipos/notificacion";
import { etiquetaTipo } from "../tipos/notificacion";
import {theme} from "../estilos/authStyles"
import {
  NotificacionContainer,
  NotificacionHeader,
  NotificacionTitle,
  NotificacionSubtitle,
  RefreshButton,
  NotificacionGrid,
  NotificacionCard,
  CardHeader,
  PrioridadBadge,
  EstadoBadge,
  CardContent,
  TipoNotificacion,
  MensajeNotificacion,
  MetaInfo,
  MetaItem,
  CardFooter,
  FechaLimite,
  ActionButton,
  EmptyState,
  LoadingState,
  ErrorMessage,
} from '../estilos/notificacionesStyles';

export default function NotificacionesTallerPagina() {
  const { usuario } = useAuth();
  const token = usuario?.token ?? "";
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>();
  const [items, setItems] = useState<NotificacionDTO[]>([]);

  const ordenadas = useMemo(() => {
    const p = { ALTA: 0, MEDIA: 1, BAJA: 2 } as const;
    return [...items].sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'PENDIENTE' ? -1 : 1;
      if (a.prioridad !== b.prioridad) return p[a.prioridad] - p[b.prioridad];
      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [items]);

  async function cargar() {
    try {
      setCargando(true);
      const data = await api.getMisNotificaciones<NotificacionDTO[]>(token);
      setItems(data);
      setError(undefined);
    } catch (e: any) {
      setError(e.message || "No se pudieron cargar las notificaciones");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { if (token) cargar(); }, [token]);

  async function marcarLeidaOptimista(id: number) {
    const anterior = [...items];
    setItems(prev => prev.map(n => n.id === id ? { ...n, estado: 'LEIDA' } : n));
    try {
      await api.marcarNotificacionLeida<{ok: true}>(id, token);
    } catch (e: any) {
      setItems(anterior);
      setError(e.message || "No se pudo marcar como leída");
    }
  }

  // Función para determinar si una fecha es urgente (menos de 3 días)
  const esUrgente = (fechaLimite: string) => {
    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diffDias = Math.ceil((limite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    return diffDias <= 3;
  };

  if (!usuario) {
    return (
      <NotificacionContainer>
        <ErrorMessage>Debes iniciar sesión para ver tus notificaciones.</ErrorMessage>
      </NotificacionContainer>
    );
  }

  return (
    <NotificacionContainer>
      <NotificacionHeader>
        <div>
          <NotificacionTitle>Mis notificaciones</NotificacionTitle>
          <NotificacionSubtitle>Alertas automáticas de mantenimiento y vencimiento de llantas</NotificacionSubtitle>
        </div>
        <RefreshButton onClick={cargar}>
          🔄 Actualizar
        </RefreshButton>
      </NotificacionHeader>

      {cargando && <LoadingState>Cargando notificaciones...</LoadingState>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {!cargando && ordenadas.length === 0 && (
        <EmptyState>
          <div style={{fontSize: "3rem", marginBottom: "1rem"}}>📋</div>
          <h3 style={{margin: "0 0 0.5rem 0", color: theme.on}}>No hay notificaciones</h3>
          <p>No tienes tareas asignadas en este momento.</p>
        </EmptyState>
      )}

      {!cargando && ordenadas.length > 0 && (
        <NotificacionGrid>
          {ordenadas.map(notificacion => (
            <NotificacionCard 
              key={notificacion.id} 
              $prioridad={notificacion.prioridad}
              $estado={notificacion.estado}
            >
              <CardHeader>
                <PrioridadBadge $prioridad={notificacion.prioridad}>
                  {notificacion.prioridad}
                </PrioridadBadge>
                <EstadoBadge $estado={notificacion.estado}>
                  {notificacion.estado === 'PENDIENTE' ? 'Pendiente' : 'Leída'}
                </EstadoBadge>
              </CardHeader>

              <CardContent>
                <TipoNotificacion>
                  {etiquetaTipo[notificacion.tipo]}
                </TipoNotificacion>
                <MensajeNotificacion>
                  {notificacion.mensaje}
                </MensajeNotificacion>
                
                <MetaInfo>
                  {notificacion.vehiculoId && (
                    <MetaItem>Vehículo ID: {notificacion.vehiculoId}</MetaItem>
                  )}
                  <MetaItem>
                    Creado: {new Date(notificacion.creadoEn).toLocaleDateString()}
                  </MetaItem>
                </MetaInfo>
              </CardContent>

              <CardFooter>
                <FechaLimite $urgente={!!(notificacion.fechaLimite && esUrgente(notificacion.fechaLimite))}>
                  {notificacion.fechaLimite ? (
                    <>
                      📅 {new Date(notificacion.fechaLimite).toLocaleString()}
                      {esUrgente(notificacion.fechaLimite) && " ⚠️ Urgente"}
                    </>
                  ) : (
                    "Sin fecha límite"
                  )}
                </FechaLimite>
                
                <ActionButton 
                  $estado={notificacion.estado}
                  onClick={() => notificacion.estado === 'PENDIENTE' && marcarLeidaOptimista(notificacion.id)}
                >
                  {notificacion.estado === 'PENDIENTE' ? '✅ Marcar como realizada' : '✅ Realizada'}
                </ActionButton>
              </CardFooter>
            </NotificacionCard>
          ))}
        </NotificacionGrid>
      )}
    </NotificacionContainer>
  );
}