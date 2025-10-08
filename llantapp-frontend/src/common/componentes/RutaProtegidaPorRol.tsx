// src/componentes/RutaProtegidaPorRol.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/proveedorestado/AuthContext';

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';

export const RutaProtegidaPorRol: React.FC<{
  rolesPermitidos: Rol[];
  children: React.ReactNode;
}> = ({ rolesPermitidos, children }) => {
  const { sesion, tieneRol } = useAuth();

  // Esperar a que termine la rehidratación Y a que el perfil exista
  if (sesion.cargando || (sesion.accessToken && !sesion.perfil)) {
    return <div style={{ padding: 24 }}>Cargando...</div>;
  }

  if (!sesion.accessToken) return <Navigate to="/login" replace />;
  if (!sesion.perfil)       return <Navigate to="/login" replace />; // safety net
  if (!tieneRol(rolesPermitidos)) return <Navigate to="/no-autorizado" replace />;

  return <>{children}</>;
};
