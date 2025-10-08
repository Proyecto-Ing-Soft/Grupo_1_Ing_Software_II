import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

const BotonCerrarSesion: React.FC<{ className?: string }> = ({ className }) => {
  const { cerrar } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      className={`logout-btn ${className ?? ''}`}
      onClick={() => {
        cerrar();
        navigate('/login', { replace: true });
      }}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  );
};

export default BotonCerrarSesion;
