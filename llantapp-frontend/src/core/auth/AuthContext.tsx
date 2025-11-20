// SRP: manejar sesión (token) + perfil (incluye rol).
// KISS/DIP: usa directamente los endpoints del backend y el JWT para cliente global.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getJSON, postJSON } from '../http/_http';
import { tokenMemoria } from '../utils/storageMemoria';
import type {
  Rol as RolApi,
  Perfil as PerfilApi,
} from '../../features/autenticacion/api';

type Rol = RolApi;

type Perfil = {
  id: number;
  nombreCompleto: string;
  rol: Rol;
  tallerSlug?: string | null;
};

type Usuario = Perfil & { token: string };

type DatosSesion = {
  accessToken: string | null;
  cargando: boolean;
  perfil?: Perfil | null;
};

type JwtAccesoFront = {
  sub: number | string;
  rol?: Rol;
  correo?: string;
  nombreCompleto?: string;
  slugTaller?: string | null;
  [k: string]: unknown;
};

type OpcionesLogin = {
  tipo?: 'clienteGlobal' | 'taller';
  slugTaller?: string;
};

const Contexto = createContext<{
  sesion: DatosSesion;
  usuario: Usuario | null;
  iniciar: (
    correo: string,
    clave: string,
    opciones?: OpcionesLogin,
  ) => Promise<void>;
  cerrar: () => void;
  refrescar: () => Promise<void>;
  tieneRol: (roles: Rol[]) => boolean;
}>({
  sesion: { accessToken: null, cargando: true, perfil: null },
  usuario: null,
  iniciar: async () => {},
  cerrar: () => {},
  refrescar: async () => {},
  tieneRol: () => false,
});

function decodeJwtPayload(token: string): JwtAccesoFront | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded =
      base64.length % 4 === 0
        ? base64
        : base64.padEnd(base64.length + (4 - (base64.length % 4)), '=');

    const json = atob(padded);
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') return null;
    return data as JwtAccesoFront;
  } catch {
    return null;
  }
}

function perfilDesdeJwt(payload: JwtAccesoFront): Perfil {
  const sub = payload.sub;
  const id =
    typeof sub === 'string'
      ? Number(sub)
      : typeof sub === 'number'
      ? sub
      : 0;

  const nombre =
    (payload.nombreCompleto as string | undefined)?.trim() ||
    (payload.correo as string | undefined) ||
    'Usuario';

  const slug =
    typeof payload.slugTaller === 'string' &&
    payload.slugTaller.trim().length > 0
      ? payload.slugTaller.trim()
      : null;

  return {
    id: Number.isFinite(id) ? id : 0,
    nombreCompleto: nombre,
    rol: (payload.rol as Rol) ?? ('CLIENTE' as Rol),
    tallerSlug: slug,
  };
}

function normalizarPerfil(
  perfilApi: PerfilApi,
  jwt?: JwtAccesoFront | null,
): Perfil {
  const nombreCompleto =
    (perfilApi as any).nombreCompleto ??
    ([
      (perfilApi as any).nombres,
      (perfilApi as any).apellidos,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      (perfilApi as any).correo ||
      (perfilApi as any).email ||
      (jwt?.correo as string | undefined) ||
      'Usuario');

  const idApi = (perfilApi as any).id;
  let id: number | undefined =
    typeof idApi === 'number' ? idApi : undefined;

  if (id === undefined && jwt?.sub != null) {
    id =
      typeof jwt.sub === 'string'
        ? Number(jwt.sub)
        : (jwt.sub as number);
  }

  const slugApi =
    (perfilApi as any).tallerSlug ??
    (perfilApi as any).slugTaller ??
    null;

  const slugJwt =
    typeof jwt?.slugTaller === 'string' &&
    jwt.slugTaller.trim().length > 0
      ? jwt.slugTaller.trim()
      : null;

  return {
    id: id ?? 0,
    nombreCompleto,
    rol: (perfilApi as any).rol ?? ((jwt?.rol as Rol) ?? ('CLIENTE' as Rol)),
    tallerSlug:
      typeof slugApi === 'string' && slugApi.length > 0 ? slugApi : slugJwt,
  };
}

function inferirSlugDesdeLocationSinFallback(): string | undefined {
  if (typeof window === 'undefined' || !window.location) return undefined;

  try {
    const url = new URL(window.location.href);

    const slugQS =
      url.searchParams.get('slugTaller') ||
      url.searchParams.get('taller') ||
      url.searchParams.get('slug');

    if (slugQS && slugQS.trim()) {
      return slugQS.trim();
    }

    const pathname = url.pathname || '';
    const partes = pathname.split('/').filter(Boolean);
    if (partes.length === 0) return undefined;

    const candidato = partes[0];
    const reservados = ['login', 'registro', 'inicio', 'solicitudes'];
    if (!reservados.includes(candidato)) {
      return candidato;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function resolverTipoLogin(
  opciones?: OpcionesLogin,
): { tipo: 'clienteGlobal' | 'taller'; slugTaller?: string } {
  if (opciones?.tipo) {
    return { tipo: opciones.tipo, slugTaller: opciones.slugTaller };
  }

  const slug = inferirSlugDesdeLocationSinFallback();
  if (slug) {
    return { tipo: 'taller', slugTaller: slug };
  }

  return { tipo: 'clienteGlobal' };
}

export const ProveedorAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sesion, setSesion] = useState<DatosSesion>({
    accessToken: null,
    cargando: true,
    perfil: null,
  });

  // - Cliente global: solo JWT.
  // - Taller (OWNER/ADMIN_TALLER/MECANICO): /auth/perfil + JWT.
  const cargarPerfil = async (tokenArg?: string) => {
    const token = tokenArg ?? tokenMemoria.get?.() ?? sesion.accessToken;
    if (!token) {
      throw new Error('No hay token disponible para consultar el perfil');
    }

    const payload = decodeJwtPayload(token);

    if (payload && payload.rol === ('CLIENTE' as Rol) && !payload.slugTaller) {
      const perfil = perfilDesdeJwt(payload);
      setSesion((s) => ({ ...s, perfil }));
      return perfil;
    }

    const perfilApi = await getJSON<PerfilApi>('/auth/perfil', token);
    const perfil = normalizarPerfil(perfilApi, payload ?? undefined);
    console.log('👤 Perfil cargado:', perfilApi);
    setSesion((s) => ({ ...s, perfil }));
    return perfil;
  };

  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await postJSON<{ accessToken: string }>(
          '/auth/refresh',
        );
        tokenMemoria.set(accessToken);
        setSesion({ accessToken, cargando: false, perfil: null });
        await cargarPerfil(accessToken);
      } catch {
        tokenMemoria.limpiar();
        setSesion({ accessToken: null, cargando: false, perfil: null });
      }
    })();
  }, []);

  const iniciar = async (
    correo: string,
    clave: string,
    opciones?: OpcionesLogin,
  ) => {
    const { tipo, slugTaller } = resolverTipoLogin(opciones);

    let accessToken: string;

    if (tipo === 'clienteGlobal') {
      const r = await postJSON<{ accessToken: string }>(
        '/auth/login-cliente-global',
        { correo, clave },
      );
      accessToken = r.accessToken;
    } else {
      const slug = slugTaller ?? inferirSlugDesdeLocationSinFallback();

      if (!slug) {
        const r = await postJSON<{ accessToken: string }>(
          '/auth/login-cliente-global',
          { correo, clave },
        );
        accessToken = r.accessToken;
      } else {
        const r = await postJSON<{ accessToken: string }>(
          '/auth/login',
          {
            slugTaller: slug,
            credenciales: { correo, clave },
          },
        );
        accessToken = r.accessToken;
      }
    }

    tokenMemoria.set(accessToken);
    setSesion({ accessToken, cargando: false, perfil: null });
    await cargarPerfil(accessToken);
  };

  const cerrar = () => {
    // Session management: limpia refresh del backend, token en memoria y perfil en contexto.
    postJSON('/auth/logout').catch(() => {});
    tokenMemoria.limpiar();
    setSesion({ accessToken: null, cargando: false, perfil: null });
  };

  const refrescar = async () => {
    const { accessToken } = await postJSON<{ accessToken: string }>(
      '/auth/refresh',
    );
    tokenMemoria.set(accessToken);
    setSesion((s) => ({ ...s, accessToken }));
    await cargarPerfil(accessToken);
  };

  const tieneRol = (roles: Rol[]) =>
    !!sesion.perfil && roles.includes(sesion.perfil.rol);

  const usuario: Usuario | null =
    sesion.accessToken && sesion.perfil
      ? { ...sesion.perfil, token: sesion.accessToken }
      : null;

  return (
    <Contexto.Provider
      value={{ sesion, usuario, iniciar, cerrar, refrescar, tieneRol }}
    >
      {children}
    </Contexto.Provider>
  );
};

export const useAuth = () => useContext(Contexto);
