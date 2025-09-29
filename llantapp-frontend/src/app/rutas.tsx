// src/rutas/Rutas.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoginPagina from '../paginas/LoginPagina';
import RegistroPagina from '../paginas/RegistroPagina';
import InicioProtegido from '../paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../paginas/RegistrarVehiculoPagina';
import NotificacionesLeerPagina from '../paginas/NotificacionesLeerPagina';

import AgendarCitaPagina from '../paginas/AgendarCitaPagina';
import MisCitasPagina from '../paginas/MisCitasPagina';
import CitasMecanicoPagina from '../paginas/CitasMecanicoPagina';

import { RutaProtegidaPorRol } from '../componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../componentes/RutaProtegida';
import LayoutProtegido from '../componentes/LayoutProtegido';

const router = createBrowserRouter(
  [
    // públicas
    { path: '/', element: <LoginPagina /> },
    { path: '/login', element: <LoginPagina /> },
    { path: '/registro', element: <RegistroPagina /> },

    // protegidas por sesión
    {
      path: '/',
      element: (
        <RutaProtegida>
          <LayoutProtegido />
        </RutaProtegida>
      ),
      children: [
        { path: 'inicio', element: <InicioProtegido /> },

        {
          path: 'vehiculos/registrar', // ✅ relativo
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
              <RegistrarVehiculoPagina />
            </RutaProtegidaPorRol>
          ),
        },

        {
          path: 'citas/agendar', // ✅ relativo (sin /)
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER','EMPRESA']}>
              <AgendarCitaPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/mias', // ✅ relativo
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER','EMPRESA']}>
              <MisCitasPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/asignadas', // ✅ relativo
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <CitasMecanicoPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'notificaciones', // ✅ relativo
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
              <NotificacionesLeerPagina />
            </RutaProtegidaPorRol>
          ),
        },
      ],
    },

    { path: '*', element: <LoginPagina /> },
  ],
  { basename: '/llantapp' } // ok si tu app está servida bajo /llantapp
);

export function Rutas() {
  return <RouterProvider router={router} />;
}
