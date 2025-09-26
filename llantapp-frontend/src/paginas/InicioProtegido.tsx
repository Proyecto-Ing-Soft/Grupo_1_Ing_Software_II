import React, { useEffect, useState } from 'react';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { HelperText, TextLink } from '../estilos/authStyles';

// SRP: ejemplo de vista protegida que llama /usuarios/yo con Bearer.
export default function InicioProtegido() {
  const { sesion, refrescar } = useAuth();
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usuarios/yo`, {
        headers: { Authorization: `Bearer ${sesion.accessToken}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        // Intentar una renovación (DRY: reuse de AuthContext).
        await refrescar();
      } else {
        setPerfil(await res.json());
      }
    })();
  }, [sesion.accessToken]);

  return (
    <>
      <div>
        <h1>Zona protegida</h1>
        <pre>{JSON.stringify(perfil, null, 2)}</pre>
      </div>

      {/* Enlaces útiles */}
      <HelperText>
        Registrar vehículos{" "}
        <TextLink to="/vehiculos/registrar">Ir a registrar</TextLink>
      </HelperText>

      <HelperText>
        Mis notificaciones{" "}
        <TextLink to="/notificaciones">Ir a notificaciones</TextLink>
      </HelperText>
    </>
  );
}
