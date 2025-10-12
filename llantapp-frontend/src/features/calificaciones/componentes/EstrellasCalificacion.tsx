import React from 'react';

export const EstrellasCalificacion: React.FC<{ value: number; size?: number }> = ({ value, size = 20 }) => (
  <div className="estrellas-calificacion" aria-label={`Calificación ${value} de 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={`estrella ${n <= value ? 'rellena' : ''}`} style={{ fontSize: size }}>
        {n <= value ? '★' : '☆'}
      </span>
    ))}
  </div>
);
