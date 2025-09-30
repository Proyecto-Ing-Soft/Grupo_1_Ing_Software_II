// src/paginas/AdminCitasPendientes.tsx

// PRINCIPIOS/PATRONES:
// - SRP: listar y asignar; nada de reglas del dominio (eso está en el backend).
// - KISS: selección por fila, acción clara "Asignar".
// - Demeter: usa apiCitas/apiUsuarios; no construye URLs ni token handling.
// - DRY: reutiliza el mismo método apiCitas.asignar para todas las filas.
// src/paginas/AdminCitasPendientes.tsx
import { useEffect, useState } from 'react';
import { apiCitas } from '../servicios/apiCitas';
import { apiUsuarios } from '../servicios/apiUsuarios';
import { getJSON } from '../servicios/_http';

// Tipos mínimos para esta vista
type TipoMantenimientoFE = 'PREVENTIVO' | 'CORRECTIVO' | 'LEGAL_ITV' | 'EXTRAS';
type EstadoCitaFE = 'SOLICITADA' | 'EN_PROGRESO' | 'TERMINADA';

interface CitaRow {
  id: number;
  tipo: TipoMantenimientoFE;
  estado: EstadoCitaFE;
  programadaPara?: string | null; // ISO string
  vehiculo?: { placa: string } | null;
  clienteId: number;
  mecanicoId?: number | null;
}

interface MecanicoRow {
  id: number;
  nombreCompleto: string;
}

export default function AdminCitasPendientes() {
  const [citas, setCitas] = useState<CitaRow[]>([]);
  const [mecanicos, setMecanicos] = useState<MecanicoRow[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});

  useEffect(() => {
    apiCitas.pendientesAdmin().then(setCitas);
    apiUsuarios.listarPorRol('MECANICO').then(setMecanicos);
  }, []);

  const asignar = async (citaId: number) => {
    const mecId = seleccion[citaId];
    if (!mecId) return alert('Selecciona un mecánico');
    await apiCitas.asignar(citaId, mecId);
    setCitas(prev => prev.filter(c => c.id !== citaId)); // refresco optimista
  };

  return (
    <div>
      <h2>Citas pendientes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Placa</th><th>Fecha</th><th>Tipo</th><th>Mecánico</th><th></th>
          </tr>
        </thead>
        <tbody>
          {citas.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.vehiculo?.placa ?? '-'}</td>
              <td>{c.programadaPara?.slice(0, 10) ?? '-'}</td>
              <td>{c.tipo}</td>
              <td>
                <select
                  value={seleccion[c.id] ?? ''}
                  onChange={e => setSeleccion(s => ({ ...s, [c.id]: Number(e.target.value) }))}
                >
                  <option value="">Asignar...</option>
                  {mecanicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombreCompleto}</option>
                  ))}
                </select>
              </td>
              <td><button onClick={() => asignar(c.id)}>Asignar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
