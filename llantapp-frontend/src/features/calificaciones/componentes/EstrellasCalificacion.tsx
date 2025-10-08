interface EstrellasCalificacionProps {
  valor: number;
  onCambiar: (nuevoValor: number) => void;
  tamano?: number;
  ariaLabel?: string;
}

export default function EstrellasCalificacion({
  valor,
  onCambiar,
  tamano = 32,
  ariaLabel = "Calificación",
}: EstrellasCalificacionProps) {
  const estrellas = [1, 2, 3, 4, 5];

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onCambiar(Math.min(5, valor + 1));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onCambiar(Math.max(1, valor - 1));
    }
    if (e.key === "0") onCambiar(0);
    if (e.key === "5") onCambiar(5);
  };

  return (
    <div
      className="estrellas-calificacion"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={valor}
      tabIndex={0}
      onKeyDown={onKey}
    >
      {estrellas.map((n) => (
        <svg
          key={n}
          width={tamano}
          height={tamano}
          viewBox="0 0 24 24"
          onClick={() => onCambiar(n)}
          className={`estrella ${n <= valor ? "rellena" : ""}`}
          aria-hidden="true"
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.171L12 18.896 4.664 23.168l1.402-8.171L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
}
