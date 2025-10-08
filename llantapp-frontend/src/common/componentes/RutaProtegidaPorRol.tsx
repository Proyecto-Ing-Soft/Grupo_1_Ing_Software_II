import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';

export const RutaProtegidaPorRol: React.FC<{
  rolesPermitidos: Rol[];
  children: React.ReactNode;
}> = ({ rolesPermitidos, children }) => {
  const { sesion, tieneRol } = useAuth();

  // Esperar a que termine la rehidratación y a que el perfil exista
  if (sesion.cargando || (sesion.accessToken && !sesion.perfil)) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  if (!sesion.accessToken) return <Navigate to="/login" replace />;
  if (!sesion.perfil) return <Navigate to="/login" replace />; // Safety net
  if (!tieneRol(rolesPermitidos)) return <Navigate to="/no-autorizado" replace />;

  return <>{children}</>;
};