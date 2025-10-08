import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

// Si ya hay sesión, redirige a /inicio; si no, muestra los children (login/registro)
export const RedirigirSiAutenticado: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sesion } = useAuth();

  if (sesion.cargando) return <div>Cargando...</div>;
  if (sesion.accessToken) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
};

export default RedirigirSiAutenticado;