import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorAuth } from './core/auth/AuthContext';
import { Rutas } from './app/rutas';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProveedorAuth>
        <Rutas />
      </ProveedorAuth>
    </BrowserRouter>
  </React.StrictMode>
);