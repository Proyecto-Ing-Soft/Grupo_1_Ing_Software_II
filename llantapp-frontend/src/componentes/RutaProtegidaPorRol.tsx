// rutas/RutaProtegidaPorRol.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/proveedorestado/AuthContext';

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CONDUCTOR';

export const RutaProtegidaPorRol: React.FC<{
  rolesPermitidos: Rol[];
  children: React.ReactNode;
}> = ({ rolesPermitidos, children }) => {
  const { sesion, tieneRol } = useAuth();

  if (sesion.cargando) return <div>Cargando...</div>;
  if (!sesion.accessToken) return <Navigate to="/login" replace />;
  if (!tieneRol(rolesPermitidos)) return <Navigate to="/no-autorizado" replace />;

  return <>{children}</>;
};

