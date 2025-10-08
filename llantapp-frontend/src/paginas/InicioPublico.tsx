import React from 'react';
import { Link } from 'react-router-dom';

const InicioPublico: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Bienvenido a Llantapp</h1>
        <p style={{ marginBottom: 24 }}>
          Esta es una página pública. Puedes explorar y luego iniciar sesión o registrarte.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/login">Ir a Iniciar Sesión</Link>
          <span>·</span>
          <Link to="/registro">Crear una cuenta</Link>
        </div>
      </div>
    </div>
  );
};

export default InicioPublico;
