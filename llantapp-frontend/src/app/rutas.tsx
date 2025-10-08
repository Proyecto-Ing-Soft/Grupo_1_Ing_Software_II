import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// PAGINAS
import LoginPagina from '../features/autenticacion/LoginPagina';
import RegistroPagina from '../features/autenticacion/RegistroPagina';
import InicioProtegido from '../common/paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../features/vehiculos/RegistrarVehiculoPagina';
import NotificacionesLeerPagina from '../features/notificaciones/NotificacionesLeerPagina';
import AgendarCitaPagina from '../paginas/AgendarCitaPagina';
import MisCitasPagina from '../features/mantenimientos/MisCitasPagina';
import CitasMecanicoPagina from '../features/mantenimientos/CitasMecanicoPagina';
import AdminCitasPendientes from '../features/asignaciones/AsociarMecanicoPagina';
import CatalogoServiciosPagina from '../features/catalogo-servicios/CatalogoServiciosPagina';
import AsociarMecanicoServicioPagina from '../features/asignaciones/AsociarMecanicoHector';
import GestionUsuariosPagina from '../features/usuarios/GestionUsuariosPagina';
import RegistrarMantenimientoPagina from '../features/mantenimientos/RegistrarMantenimientoPagina';

// ROL PROTEGIENDO PAGINAS
import { RutaProtegidaPorRol } from '../common/componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../common/componentes/RutaProtegida';

// LAYOUT
import LayoutProtegido from '../common/componentes/LayoutProtegido';

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

        // MECANICO: registrar mantenimiento
        {
          path: 'mantenimientos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <RegistrarMantenimientoPagina />
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
