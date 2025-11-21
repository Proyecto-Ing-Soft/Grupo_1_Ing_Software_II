import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiConsumibles, Consumible } from './api';
import './adminConsumibles.css';

export default function AdminConsumiblesPagina() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Consumible[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nombre: '',
    unidad: '',
    stockActual: 0,
    stockMinimo: 0,
    descripcion: '',
    activo: true,
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      nombre: '',
      unidad: '',
      stockActual: 0,
      stockMinimo: 0,
      descripcion: '',
      activo: true,
    });
  };

  const cargar = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await apiConsumibles.listar();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el inventario');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      x =>
        x.nombre.toLowerCase().includes(q) ||
        x.unidad.toLowerCase().includes(q),
    );
  }, [busqueda, items]);

  const onEdit = (c: Consumible) => {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre,
      unidad: c.unidad,
      stockActual: c.stockActual,
      stockMinimo: c.stockMinimo,
      descripcion: c.descripcion ?? '',
      activo: c.activo,
    });
  };

  const onDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar consumible del inventario?')) return;
    try {
      await apiConsumibles.eliminar(id);
      setItems(prev => prev.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e?.message || 'No se pudo eliminar');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingId) {
        const actualizado = await apiConsumibles.actualizar(editingId, form);
        setItems(prev => prev.map(x => (x.id === editingId ? actualizado : x)));
      } else {
        const creado = await apiConsumibles.crear(form);
        setItems(prev =>
          [...prev, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        );
      }
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el consumible');
    }
  };

  return (
    <main className="inv">
      <header className="inv__header">
        <div className="inv__titleWrap">
          <h1 className="inv__title">Inventario de consumibles</h1>
          <p className="inv__sub">
            Gestiona los insumos del taller: aceites, filtros, neumáticos, etc.
          </p>
        </div>
        <div className="inv__toolbar">
          <button
            type="button"
            className="inv-btn inv-btn--ghost"
            onClick={() => navigate('/inicio')}
          >
            ⬅️ Volver al inicio
          </button>
        </div>
      </header>

      <section className="inv__body">
        <aside className="inv__formCard">
          <h2 className="inv__formTitle">
            {editingId ? 'Editar consumible' : 'Nuevo consumible'}
          </h2>
          <form className="inv-form" onSubmit={onSubmit}>
            <div className="inv-field">
              <label>Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                required
              />
            </div>

            <div className="inv-field">
              <label>Unidad</label>
              <input
                type="text"
                placeholder="ej: lt, und, kg"
                value={form.unidad}
                onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}
                required
              />
            </div>

            <div className="inv-field inv-field--row">
              <div>
                <label>Stock actual</label>
                <input
                  type="number"
                  min={0}
                  value={form.stockActual}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      stockActual: Number(e.target.value || 0),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label>Stock mínimo</label>
                <input
                  type="number"
                  min={0}
                  value={form.stockMinimo}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      stockMinimo: Number(e.target.value || 0),
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="inv-field">
              <label>Descripción</label>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={e =>
                  setForm(f => ({ ...f, descripcion: e.target.value }))
                }
              />
            </div>

            {/* Switch de estado (sin botón extra) */}
            <div className="inv-formFooter">
              <label className="inv-switch">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={e =>
                    setForm(f => ({ ...f, activo: e.target.checked }))
                  }
                />
                <span className="inv-switch__track">
                  <span className="inv-switch__thumb" />
                </span>
                <span className="inv-switch__label">Activo en inventario</span>
              </label>
            </div>

            {error && <div className="inv__error">{error}</div>}

            <div className="inv__formActions">
              <button type="submit" className="inv-btn inv-btn--primary">
                {editingId ? 'Guardar cambios' : 'Crear consumible'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="inv-btn inv-btn--ghost"
                  onClick={resetForm}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="inv__tableCard">
          <div className="inv__tableHead">
            <h2 className="inv__tableTitle">Listado</h2>
            <input
              className="inv__search"
              placeholder="Buscar por nombre o unidad…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {cargando ? (
            <p className="inv__state">Cargando inventario…</p>
          ) : (
            <div className="inv__tableWrapper">
              {filtrados.length === 0 ? (
                <p className="inv__state">No hay consumibles que coincidan.</p>
              ) : (
                <table className="inv__table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Unidad</th>
                      <th>Stock</th>
                      <th>Mínimo</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(c => (
                      <tr key={c.id}>
                        <td>{c.nombre}</td>
                        <td>{c.unidad}</td>
                        <td>{c.stockActual}</td>
                        <td>{c.stockMinimo}</td>
                        <td>
                          <span
                            className={
                              'inv-chip ' +
                              (c.activo ? 'inv-chip--ok' : 'inv-chip--off')
                            }
                          >
                            {c.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="inv__actionsCell">
                          <button
                            type="button"
                            className="inv-link"
                            onClick={() => onEdit(c)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="inv-link inv-link--danger"
                            onClick={() => onDelete(c.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
