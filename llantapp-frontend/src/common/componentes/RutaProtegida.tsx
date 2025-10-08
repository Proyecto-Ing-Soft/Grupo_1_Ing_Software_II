import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

// SRP: proteger rutas que requieren sesión.
// KISS: componente pequeño y claro.
export const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sesion } = useAuth();

  if (sesion.cargando) return <div>Cargando...</div>;
  if (!sesion.accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
};