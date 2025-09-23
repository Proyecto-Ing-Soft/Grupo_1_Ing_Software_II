import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ProveedorAuth } from './app/proveedorestado/AuthContext';
import { Rutas } from './app/rutas';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ProveedorAuth>
        <Rutas />
      </ProveedorAuth>
  </React.StrictMode>
);
