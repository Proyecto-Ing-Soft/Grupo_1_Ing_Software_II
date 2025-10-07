// src/app/Rutas.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// PAGINAS
import LoginPagina from '../paginas/LoginPagina';
import RegistroPagina from '../paginas/RegistroPagina';
import InicioProtegido from '../paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../paginas/RegistrarVehiculoPagina';
import NotificacionesLeerPagina from '../paginas/NotificacionesLeerPagina';
import AgendarCitaPagina from '../paginas/AgendarCitaPagina';
import MisCitasPagina from '../paginas/MisCitasPagina';
import CitasMecanicoPagina from '../paginas/CitasMecanicoPagina';
import AdminCitasPendientes from '../paginas/AdminCitasPendientes';
import CatalogoServiciosPagina from '../paginas/CatalogoServiciosPagina';
import AsociarMecanicoServicioPagina from '../paginas/AsociarMecanicoServicioPagina';
import GestionUsuariosPagina from '../paginas/GestionUsuariosPagina';

// ROL PROTEGIENDO PAGINAS
import { RutaProtegidaPorRol } from '../componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../componentes/RutaProtegida';

// LAYOUT
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

        // ADMIN: revisar y asignar citas pendientes
        {
          path: 'admin/citas-pendientes',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminCitasPendientes />
            </RutaProtegidaPorRol>
          ),
        },

        // ADMIN: catálogo de servicios
        {
          path: 'admin/servicios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <CatalogoServiciosPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // ADMIN: asociar mecánico a servicio
        {
          path: 'admin/servicios/asociar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AsociarMecanicoServicioPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // ADMIN: gestionar usuarios
        {
          path: 'admin/usuarios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <GestionUsuariosPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // ADMIN y MECANICO: registrar vehículo
        {
          path: 'vehiculos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'MECANICO']}>
              <RegistrarVehiculoPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // CHOFER o EMPRESA: agendar y ver sus citas
        {
          path: 'citas/agendar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
              <AgendarCitaPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/mias',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
              <MisCitasPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // MECANICO: ver citas asignadas
        {
          path: 'citas/asignadas',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <CitasMecanicoPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // CHOFER, EMPRESA o MECANICO: notificaciones
        {
          path: 'notificaciones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA', 'MECANICO']}>
              <NotificacionesLeerPagina />
            </RutaProtegidaPorRol>
          ),
        },
      ],
    },

    { path: '*', element: <LoginPagina /> },
  ],
  { basename: '/llantapp' }
);

export function Rutas() {
  return <RouterProvider router={router} />;
}
