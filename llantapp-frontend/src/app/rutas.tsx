// src/rutas/Rutas.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

//PAGINAS
import LoginPagina from '../paginas/LoginPagina';
import RegistroPagina from '../paginas/RegistroPagina';
import InicioProtegido from '../paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../paginas/RegistrarVehiculoPagina';
import NotificacionesLeerPagina from '../paginas/NotificacionesLeerPagina';
import AgendarCitaPagina from '../paginas/AgendarCitaPagina';
import MisCitasPagina from '../paginas/MisCitasPagina';
import CitasMecanicoPagina from '../paginas/CitasMecanicoPagina';

//ROL PROTEGIENDO PAGINAS
import { RutaProtegidaPorRol } from '../componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../componentes/RutaProtegida';

//LAYOUT
import LayoutProtegido from '../componentes/LayoutProtegido';

// - Seguridad por capas: RutaProtegidaPorRol (UI) + RolesGuard (API).
// - KISS + Ley de Demeter: el componente pregunta a AuthContext; no lee token/jwt directo.
// - Facade: AuthContext "facadea" sesión/refresh/perfil para el resto de la UI.

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
          path: 'vehiculos/registrar', // Solo puede ingresar ADMIN y MECANICO
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'MECANICO']}>
              <RegistrarVehiculoPagina />
            </RutaProtegidaPorRol>
          ),
        },

        {
          path: 'citas/agendar', // Solo CHOFER o EMPRESA
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER','EMPRESA']}>
              <AgendarCitaPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/mias', // Solo CHOFER o EMPRESA
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER','EMPRESA']}>
              <MisCitasPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/asignadas', // Solo MECANICO
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <CitasMecanicoPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'notificaciones', // Solo CHOFER, EMPRESA o MECANICO
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
  { basename: '/llantapp' } // para que la url diga llantapp xd
);

export function Rutas() {
  return <RouterProvider router={router} />;
}
