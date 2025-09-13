import React, { useState } from 'react';
import '../estilos/RecuperarContraseña.css';

export default function RecuperarContraseña() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      setMensaje('');
      return;
    }
    setError('');
    try {
      const response = await fetch('http://localhost:3000/api/recuperar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo enviar el correo de recuperación.');
        setMensaje('');
        return;
      }
      setMensaje(data.mensaje || 'Se ha enviado un correo para recuperar tu contraseña.');
    } catch (err) {
      setError('Error de conexión con el servidor');
      setMensaje('');
    }
  };

  return (
    <div className="recuperar-container">
      <form className="recuperar-form" onSubmit={handleSubmit}>
        <h2>Recuperar Contraseña</h2>
        {error && <div className="recuperar-error">{error}</div>}
        {mensaje && <div className="recuperar-mensaje">{mensaje}</div>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit">Enviar instrucciones</button>
        <p className="recuperar-login-link">¿Ya la recordaste? <a href="/login">Inicia sesión</a></p>
      </form>
    </div>
  );
}
