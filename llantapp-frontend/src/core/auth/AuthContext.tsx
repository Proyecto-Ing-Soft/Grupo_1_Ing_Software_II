// SRP: manejar sesión (token) + perfil (incluye rol)
// OCP: si mañana cambias origen del perfil (decode JWT o endpoint), consumidores no cambian.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiAuth } from '../../features/autenticacion/api';
import { tokenMemoria } from '../utils/storageMemoria';

type Rol = 'ADMIN' | 'MECANICO' | 'ASISTENTE' | 'CHOFER' | 'EMPRESA';
type Perfil = { id: number; nombreCompleto: string; rol: Rol };
type Usuario = Perfil & { token: string };

type DatosSesion = {
  accessToken: string | null;
  cargando: boolean;
  perfil?: Perfil | null;
};

const Contexto = createContext<{
  sesion: DatosSesion;
  usuario: Usuario | null;
  iniciar: (correo: string, clave: string) => Promise<void>;
  cerrar: () => void;
  refrescar: () => Promise<void>;
  tieneRol: (roles: Rol[]) => boolean;
}>({
  sesion: { accessToken: null, cargando: true, perfil: null },
  usuario: null,
  iniciar: async () => {},
  cerrar: () => {},
  refrescar: async () => {},
  tieneRol: () => false
});

export const ProveedorAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sesion, setSesion] = useState<DatosSesion>({
    accessToken: null,
    cargando: true,
    perfil: null
  });

  // KISS/SRP: cargar perfil cuando hay token.
  const cargarPerfil = async (tokenArg?: string) => {
    const token = tokenArg ?? tokenMemoria.get?.() ?? sesion.accessToken;
    if (!token) throw new Error('No hay token disponible para consultar el perfil');
    const perfil = await apiAuth.perfil(token);
    console.log('👤 Perfil cargado:', perfil);
    setSesion((s) => ({ ...s, perfil }));
    return perfil;
  };

  // Al montar: intenta refresh y luego perfil.
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await apiAuth.refresh();
        tokenMemoria.set(accessToken);
        setSesion({ accessToken, cargando: false, perfil: null });
        await cargarPerfil(accessToken);
      } catch {
        tokenMemoria.limpiar();
        setSesion({ accessToken: null, cargando: false, perfil: null });
      }
    })();
  }, []);

  const iniciar = async (correo: string, clave: string) => {
    const { accessToken } = await apiAuth.login({ correo, clave });
    tokenMemoria.set(accessToken);
    setSesion({ accessToken, cargando: false, perfil: null });
    await cargarPerfil(accessToken);
  };

  const cerrar = () => {
    apiAuth.logout().catch(() => {});
    tokenMemoria.limpiar();
    setSesion({ accessToken: null, cargando: false, perfil: null });
  };

  const refrescar = async () => {
    const { accessToken } = await apiAuth.refresh();
    tokenMemoria.set(accessToken);
    setSesion((s) => ({ ...s, accessToken }));
    await cargarPerfil(accessToken);
  };

  const tieneRol = (roles: Rol[]) => !!sesion.perfil && roles.includes(sesion.perfil.rol);

  const usuario: Usuario | null =
    sesion.accessToken && sesion.perfil
      ? { ...sesion.perfil, token: sesion.accessToken }
      : null;

  return (
    <Contexto.Provider value={{ sesion, usuario, iniciar, cerrar, refrescar, tieneRol }}>
      {children}
    </Contexto.Provider>
  );
};

export const useAuth = () => useContext(Contexto);
