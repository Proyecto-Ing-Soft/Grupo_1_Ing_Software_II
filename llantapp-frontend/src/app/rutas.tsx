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
import InicioPublico from '../paginas/InicioPublico';
import RedirigirSiAutenticado from '../common/componentes/RedirigirSiAutenticado';

// ROL PROTEGIENDO PAGINAS
import { RutaProtegidaPorRol } from '../common/componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../common/componentes/RutaProtegida';

// LAYOUT
import LayoutProtegido from '../common/componentes/LayoutProtegido';

const router = createBrowserRouter(
  [
    // públicas
    { path: '/', element: <InicioPublico /> },
    {
      path: '/login',
      element: (
        <RedirigirSiAutenticado>
          <LoginPagina />
        </RedirigirSiAutenticado>
      ),
    },
    {
      path: '/registro',
      element: (
        <RedirigirSiAutenticado>
          <RegistroPagina />
        </RedirigirSiAutenticado>
      ),
    },
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
          path: 'admin/citas-pendientes',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminCitasPendientes />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/servicios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <CatalogoServiciosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/servicios/asociar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AsociarMecanicoServicioPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/usuarios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <GestionUsuariosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'vehiculos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'MECANICO']}>
              <RegistrarVehiculoPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'mantenimientos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <RegistrarMantenimientoPagina />
            </RutaProtegidaPorRol>
          ),
        },
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
        {
          path: 'citas/asignadas',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <CitasMecanicoPagina />
            </RutaProtegidaPorRol>
          ),
        },
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

    { path: '*', element: <InicioPublico /> },
  ],
  {
    // usa el base de Vite y quita la barra final
    basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
  }
);


export function Rutas() {
  return <RouterProvider router={router} />;
}
