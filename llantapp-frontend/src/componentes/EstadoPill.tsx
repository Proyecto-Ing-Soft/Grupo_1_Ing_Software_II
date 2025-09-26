// src/componentes/EstadoPill.tsx
import React from "react";
import type { Estado, Prioridad } from "../tipos/notificacion";

export const PillEstado: React.FC<{estado: Estado}> = ({ estado }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
      {estado === 'PENDIENTE' ? 'Pendiente' : 'Leída'}
    </span>
  );
};

export const PillPrioridad: React.FC<{prioridad: Prioridad}> = ({ prioridad }) => {
  const cls = prioridad === 'ALTA' ? 'bg-red-100 text-red-800'
            : prioridad === 'MEDIA' ? 'bg-orange-100 text-orange-800'
            : 'bg-blue-100 text-blue-800';
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>{prioridad}</span>;
};
