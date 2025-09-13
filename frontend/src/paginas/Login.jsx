import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../estilos/Login.css';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!correo || !password) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.error || 'Credenciales inválidas');
        return;
      }

      login(data); 

      navigate('/');
    } catch (err) {
      setMensaje('Error al conectar con el servidor');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        {mensaje && <div className="login-error">{mensaje}</div>}
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
        <button type="submit">Ingresar</button>
        <p className="login-register-link">
          ¿No tienes cuenta? <a href="/registro">Regístrate</a>
        </p>
        <p className="login-recuperar-link">
          <a href="/recuperar">¿Olvidaste tu contraseña?</a>
        </p>
      </form>
    </div>
  );
}
