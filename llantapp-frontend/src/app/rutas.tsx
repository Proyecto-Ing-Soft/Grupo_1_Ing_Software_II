import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPagina from '../paginas/LoginPagina';
import RegistroPagina from '../paginas/RegistroPagina';
import InicioProtegido from '../paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../paginas/RegistrarVehiculoPagina';
import NotificacionesTallerPagina from '../paginas/NotificacionesLeerPagina';
import { RutaProtegidaPorRol } from '../componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../componentes/RutaProtegida';

const router = createBrowserRouter(
  [
    { path: '/', element: <LoginPagina /> },
    { path: '/login', element: <LoginPagina /> },
    { path: '/registro', element: <RegistroPagina /> },
    { path: '/inicio', element: <RutaProtegida><InicioProtegido /></RutaProtegida> },

    {
      path: '/vehiculos/registrar',
      element: (
        <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'MECANICO']}>
          <RegistrarVehiculoPagina />
        </RutaProtegidaPorRol>
      ),
    },

    {
      path: '/notificaciones',
      element: (
        <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
          <NotificacionesTallerPagina />
        </RutaProtegidaPorRol>
      ),
    },

    { path: '*', element: <LoginPagina /> },
  ],
  { basename: '/llantapp' }
);

export function Rutas() {
  return <RouterProvider router={router} />;
}
