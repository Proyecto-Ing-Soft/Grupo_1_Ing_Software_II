import React from "react";
import { useNavigate } from "react-router-dom";
import { UsuarioItem } from "../api";
import "./FormularioEnviarPromocion.css";

export type Props = {
  titulo: string;
  mensaje: string;
  inicio: string;
  fin: string;
  fechaInvalida: boolean;
  enviando: boolean;

  usuarios: UsuarioItem[];
  seleccionados: number[];
  cargandoUsuarios: boolean;

  okMsg: string | null;
  errorMsg: string | null;

  setTitulo: (v: string) => void;
  setMensaje: (v: string) => void;
  setInicio: (v: string) => void;
  setFin: (v: string) => void;

  toggleUsuario: (id: number) => void;
  toggleTodos: () => void;

  onSubmit: (e: React.FormEvent) => void;
};

export default function FormularioEnviarPromocion({
  titulo,
  mensaje,
  inicio,
  fin,

  setTitulo,
  setMensaje,
  setInicio,
  setFin,

  fechaInvalida,

  usuarios,
  seleccionados,
  cargandoUsuarios,
  okMsg,
  errorMsg,

  toggleUsuario,
  toggleTodos,

  enviando,

  onSubmit,
}: Props) {
  const hoy = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  return (
    <form className="crear-form form-grid" onSubmit={onSubmit}>

      {/* === COLUMNA IZQUIERDA === */}
      <div className="form-column">

        {/* TÍTULO */}
        <div className="form-group">
          <label htmlFor="titulo">
            Título <span className="required">*</span>
          </label>
          <input
            id="titulo"
            placeholder="Ej: Oferta del mes"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        {/* MENSAJE */}
        <div className="form-group">
          <label htmlFor="mensaje">
            Mensaje <span className="required">*</span>
          </label>
          <textarea
            id="mensaje"
            placeholder="Ej: Esta semana obtén 10% de descuento..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />
        </div>

        {/* FECHAS */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha-inicio">
              Fecha inicio <span className="required">*</span>
            </label>
            <input
              id="fecha-inicio"
              type="date"
              value={inicio}
              min={hoy}
              onChange={(e) => setInicio(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha-fin">
              Fecha fin <span className="required">*</span>
            </label>
            <input
              id="fecha-fin"
              type="date"
              value={fin}
              min={hoy}
              onChange={(e) => setFin(e.target.value)}
              required
            />
          </div>
        </div>

        {/* ERROR DE FECHA */}
        {fechaInvalida && (
          <div className="error-msg">
            La fecha de fin debe ser posterior a la fecha de inicio.
          </div>
        )}

        {/* BOTONES */}
        <div className="crear-botones">
          <button type="submit" className="btn-submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar promoción"}
          </button>

          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/inicio")}
            disabled={enviando}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* === COLUMNA DERECHA: DESTINATARIOS === */}
      <div className="form-column">
        <label className="dest-label">
          Destinatarios <span className="required">*</span>
        </label>

        {/* MANTENEMOS errorMsg AQUÍ TAMBIÉN (si quieres mostrarlo en ambos lados) */}
        {errorMsg && (
          <div className="error-msg" style={{ marginBottom: "10px" }}>
            {errorMsg}
          </div>
        )}

        {cargandoUsuarios && <p>Cargando clientes...</p>}

        {!cargandoUsuarios && usuarios.length > 0 && (
          <>
            <label className="cliente-row cliente-row-todos">
              <input
                id="select-all"
                type="checkbox"
                checked={seleccionados.length === usuarios.length}
                onChange={toggleTodos}
                disabled={enviando}
              />
              <span>Seleccionar todos</span>
            </label>

            <div className="cliente-lista">
              {usuarios.map((u) => (
                <label
                  key={u.id}
                  className="cliente-row"
                  htmlFor={`u-${u.id}`}
                >
                  <input
                    id={`u-${u.id}`}
                    type="checkbox"
                    checked={seleccionados.includes(u.id)}
                    onChange={() => toggleUsuario(u.id)}
                    disabled={enviando}
                  />
                  <span>{u.nombre}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {!cargandoUsuarios && usuarios.length === 0 && (
          <p>No hay clientes registrados.</p>
        )}
      </div>
    </form>
  );
}
