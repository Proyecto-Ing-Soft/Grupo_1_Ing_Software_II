import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// PÁGINAS PÚBLICAS
import InicioPublico from '../paginas/inicio-publico/InicioPublico';

// PÁGINAS PÚBLICAS ESTÁTICAS (nuevas)
import CentroAyudaPagina from '../paginas/estaticas/CentroAyudaPagina';
import ContactoPagina from '../paginas/estaticas/ContactoPagina';
import LibroReclamacionesPagina from '../paginas/estaticas/LibroReclamacionesPagina';
import TerminosPagina from '../paginas/estaticas/TerminosPagina';
import PrivacidadPagina from '../paginas/estaticas/PrivacidadPagina';
import CookiesPagina from '../paginas/estaticas/CookiesPagina';

// PÁGINAS AUTENTICACIÓN
import LoginPagina from '../features/autenticacion/LoginPagina';
import RegistroPagina from '../features/autenticacion/RegistroPagina';

// PÁGINAS PROTEGIDAS
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
// --- NUEVAS PÁGINAS ---
import MisVehiculosPagina from '../features/vehiculos/MisVehiculosPagina';
import HistorialDeServiciosPagina from '../features/vehiculos/HistorialDeServiciosPagina';

// GUARDS / LAYOUT
import RedirigirSiAutenticado from '../common/componentes/RedirigirSiAutenticado';
import { RutaProtegidaPorRol } from '../common/componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../common/componentes/RutaProtegida';
import LayoutProtegido from '../common/componentes/LayoutProtegido';

const router = createBrowserRouter(
  [
    // === Públicas ===
    { path: '/', element: <InicioPublico /> },
    { path: '/centro-ayuda', element: <CentroAyudaPagina /> },
    { path: '/contacto', element: <ContactoPagina /> },
    { path: '/libro-reclamaciones', element: <LibroReclamacionesPagina /> },
    { path: '/terminos', element: <TerminosPagina /> },
    { path: '/privacidad', element: <PrivacidadPagina /> },
    { path: '/cookies', element: <CookiesPagina /> },

    {
      path: '/login/:rol',
      element: (
        <RedirigirSiAutenticado>
          <LoginPagina />
        </RedirigirSiAutenticado>
      ),
    },
    {
      path: '/login',
      element: (
        <RedirigirSiAutenticado>
          <LoginPagina />
        </RedirigirSiAutenticado>
      ),
    },
    {
      path: '/registro/:rol',
      element: (
        <RedirigirSiAutenticado>
          <RegistroPagina />
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

    // === Protegidas por sesión ===
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
        // --- NUEVAS RUTAS AÑADIDAS AQUÍ ---
        {
          path: 'vehiculos/mios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA']}>
              <MisVehiculosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'vehiculos/:id/historial',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CHOFER', 'EMPRESA', 'ADMIN', 'MECANICO']}>
              <HistorialDeServiciosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        // --- FIN DE NUEVAS RUTAS ---
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
