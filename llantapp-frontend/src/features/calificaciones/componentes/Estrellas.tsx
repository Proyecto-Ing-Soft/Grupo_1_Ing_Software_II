import React from 'react';

export const Estrellas: React.FC<{
  value: number;
  onChange: (n: number) => void;
  size?: number;
}> = ({ value, onChange, size = 22 }) => {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          aria-label={`${n} estrellas`}
          aria-checked={value === n}
          role="radio"
          onClick={() => onChange(n)}
          className="cursor-pointer select-none"
          style={{ fontSize: size }}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
};
