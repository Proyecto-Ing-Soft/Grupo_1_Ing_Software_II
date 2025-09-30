// src/componentes/BotonTerminar.tsx

// PRINCIPIOS:
// - SRP: componente pequeño de una sola acción.
// - KISS: lógica de habilitar por fecha clara y local.
// - Defense in depth: validación UI + validación servidor (backend) → robustez.
// - Demeter: delega “terminar” al apiCitas (fachada), no conoce fetch/token.
import { apiCitas } from '../servicios/apiCitas';

export function BotonTerminar({ cita }: { cita: any }) {
  const hoy = new Date().toISOString().slice(0,10);
  const programada = cita.programadaPara?.slice(0,10);
  const disabled = hoy !== programada;

  const terminar = async () => {
    await apiCitas.terminar(cita.id);
    alert('Mantenimiento terminado');
  };

  return (
    <button disabled={disabled} onClick={terminar} title={disabled ? 'Solo el día programado' : 'Terminar'}>
      TERMINADO
    </button>
  );
}
