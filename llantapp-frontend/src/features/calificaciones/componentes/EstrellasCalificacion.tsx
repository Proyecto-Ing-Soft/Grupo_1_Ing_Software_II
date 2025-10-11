import React from 'react';

export const EstrellasCalificacion: React.FC<{ value: number; size?: number }> = ({ value, size = 20 }) => (
  <div className="flex gap-1" aria-label={`Calificación ${value} de 5`}>
    {[1,2,3,4,5].map(n => (
      <span key={n} style={{ fontSize: size }}>{n <= value ? '★' : '☆'}</span>
    ))}
  </div>
);
