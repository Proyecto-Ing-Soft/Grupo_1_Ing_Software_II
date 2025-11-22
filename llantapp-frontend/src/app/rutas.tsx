// llantapp-frontend/src/app/rutas.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// PÁGINAS PÚBLICAS
import InicioPublico from '../paginas/inicio-publico/InicioPublico';

// PÁGINAS PÚBLICAS ESTÁTICAS
import CentroAyudaPagina from '../paginas/estaticas/CentroAyudaPagina';
import ContactoPagina from '../paginas/estaticas/ContactoPagina';
import LibroReclamacionesPagina from '../paginas/estaticas/LibroReclamacionesPagina';
import TerminosPagina from '../paginas/estaticas/TerminosPagina';
import PrivacidadPagina from '../paginas/estaticas/PrivacidadPagina';
import CookiesPagina from '../paginas/estaticas/CookiesPagina';

// AUTENTICACIÓN
import LoginPagina from '../features/autenticacion/LoginPagina';
import RegistroPagina from '../features/autenticacion/RegistroPagina';

// PÁGINAS PROTEGIDAS
import InicioProtegido from '../common/paginas/InicioProtegido';
import RegistrarVehiculoPagina from '../features/vehiculos/RegistrarVehiculoPagina';
import NotificacionesLeerPagina from '../features/notificaciones/NotificacionesLeerPagina';
import AgendarCitaPagina from '../features/mantenimientos/AgendarCitaPagina';
import MisCitasPagina from '../features/mantenimientos/MisCitasPagina';
import CitasMecanicoPagina from '../features/mantenimientos/CitasMecanicoPagina';
import AdminCitasPendientes from '../features/asignaciones/AsociarMecanicoPagina';
import CatalogoServiciosPagina from '../features/catalogo-servicios/CatalogoServiciosPagina';
import GestionUsuariosPagina from '../features/gestion/GestionUsuariosPagina';
import RegistrarMantenimientoPagina from '../features/mantenimientos/RegistrarMantenimientoPagina';
import MisVehiculosPagina from '../features/vehiculos/MisVehiculosPagina';
import HistorialDeServiciosPagina from '../features/historial/HistorialDeServiciosPagina';

// CALIFICACIONES
import MisCalificacionesPagina from '../features/calificaciones/pages/MisCalificacionesPagina';
import CalificarServicioPagina from '../features/calificaciones/pages/CalificarServicioPagina';
import CalificacionesRecibidasPagina from '../features/calificaciones/pages/CalificacionesRecibidasPagina';
import AdminCalificacionesPagina from '../features/calificaciones/pages/AdminCalificacionesPagina';

// NUEVO: SPRINT 2
import EnviarPromocionPagina from '../features/promociones/EnviarPromocionPagina';
import ResumenTecnicoPagina from '../features/mantenimientos/ResumenTecnicoPagina';
import RegistrarIntervencionExternaPagina from "../features/intervenciones-externas/RegistrarIntervencionExternaPagina";
import AdminConsumiblesPagina from '../features/consumibles/AdminConsumiblesPagina';
import MantenimientosVencidosPagina from "../features/mantenimientos/MantenimientosVencidosPagina";
import { SolicitudesTallerOwnerPagina } from "../features/solicitudes-taller/SolicitudesTallerOwnerPagina";

// 🔹 Auditoría / Bitácora
import AdminBitacoraAccionesPagina from '../features/auditoria/AdminBitacoraAccionesPagina';

// GUARDS / LAYOUT
import RedirigirSiAutenticado from '../common/componentes/RedirigirSiAutenticado';
import { RutaProtegidaPorRol } from '../common/componentes/RutaProtegidaPorRol';
import { RutaProtegida } from '../common/componentes/RutaProtegida';
import LayoutProtegido from '../common/componentes/LayoutProtegido';

import NoEncontrada404 from "../common/paginas/NoEncontrada404";

const router = createBrowserRouter(
  [
    // Públicas
    { path: '/', element: <InicioPublico /> },
    { path: '/centro-ayuda', element: <CentroAyudaPagina /> },
    { path: '/contacto', element: <ContactoPagina /> },
    { path: '/libro-reclamaciones', element: <LibroReclamacionesPagina /> },
    { path: '/terminos', element: <TerminosPagina /> },
    { path: '/privacidad', element: <PrivacidadPagina /> },
    { path: '/cookies', element: <CookiesPagina /> },
    { path: '/llantapp', element: <Navigate to="/" replace /> },
    { path: '/llantapp/*', element: <NoEncontrada404 /> },

    // Login / Registro
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

    // Protegidas
    {
      element: (
        <RutaProtegida>
          <LayoutProtegido />
        </RutaProtegida>
      ),
      children: [
        { path: 'inicio', element: <InicioProtegido /> },

        // Admin: Asignaciones (alias)
        {
          path: 'admin/citas-pendientes',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminCitasPendientes />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/asignaciones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminCitasPendientes />
            </RutaProtegidaPorRol>
          ),
        },

        // 🔹 Admin: Promociones
        {
          path: 'admin/promociones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <EnviarPromocionPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Admin: Servicios
        {
          path: 'admin/servicios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <CatalogoServiciosPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Admin: Inventario de consumibles
        {
          path: 'admin/consumibles',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminConsumiblesPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Admin: Gestión de Usuarios (lista/crear/editar — mismo componente)
        {
          path: 'admin/usuarios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <GestionUsuariosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/usuarios/nuevo',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <GestionUsuariosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/usuarios/:id/editar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <GestionUsuariosPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Vehículos
        {
          path: 'vehiculos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'MECANICO']}>
              <RegistrarVehiculoPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'vehiculos/mios',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <MisVehiculosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'vehiculos/:id/historial',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE', 'ADMIN', 'MECANICO']}>
              <HistorialDeServiciosPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Mantenimientos / Citas
        {
          path: 'mantenimientos/registrar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <RegistrarMantenimientoPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: "admin/mantenimientos-vencidos",
          element: (
            <RutaProtegidaPorRol rolesPermitidos={["ADMIN"]}>
              <MantenimientosVencidosPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/agendar',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <AgendarCitaPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/mias',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
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
          path: 'vehiculos/:id/intervenciones-externas',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <RegistrarIntervencionExternaPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'citas/:citaId/resumen',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <ResumenTecnicoPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Notificaciones
        {
          path: 'notificaciones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE', 'MECANICO', 'ADMIN']}>
              <NotificacionesLeerPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // Calificaciones
        {
          path: 'calificaciones/mias',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <MisCalificacionesPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'calificaciones/cita/:citaId',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['CLIENTE']}>
              <CalificarServicioPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'calificaciones/recibidas',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['MECANICO']}>
              <CalificacionesRecibidasPagina />
            </RutaProtegidaPorRol>
          ),
        },
        {
          path: 'admin/calificaciones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN']}>
              <AdminCalificacionesPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // OWNER: solicitudes de talleres
        {
          path: 'owner/solicitudes-taller',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['OWNER' as any]}>
              <SolicitudesTallerOwnerPagina />
            </RutaProtegidaPorRol>
          ),
        },

        // 🔹 ADMIN + OWNER: bitácora de acciones
        {
          path: 'admin/bitacora-acciones',
          element: (
            <RutaProtegidaPorRol rolesPermitidos={['ADMIN', 'OWNER' as any]}>
              <AdminBitacoraAccionesPagina />
            </RutaProtegidaPorRol>
          ),
        },
      ],
    },

    { path: '*', element: <NoEncontrada404 /> },
  ],
  {
    basename: (import.meta.env.BASE_URL || '/').replace(/\/$/, ''),
  }
);

export function Rutas() {
  return <RouterProvider router={router} />;
}
