import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../estilos/Register.css';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !correo || !password || !confirmPassword) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');

    try {
        const response = await fetch('http://localhost:3000/api/auth/registro', {
        method: 'POST',
        body: JSON.stringify({ nombre, apellido, correo, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error al registrar usuario');
        return;
      }

      navigate('/login');
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro</h2>
        {error && <div className="register-error">{error}</div>}

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Registrarse</button>

        <p className="register-login-link">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  );
}
