import React from "react";
import "../previewCita.css";
import calendarIcon from "../../../assets/public/calendar-day.svg";

interface PreviewCitaProps {
  form: {
    servicioNombre: string;
    placa: string;
    marca: string;
    modelo: string;
    programadaPara: string;
  };
}

export default function PreviewCita({ form }: PreviewCitaProps) {
  return (
    <div className="preview-cita">
      <div className="preview-header">
        <img src={calendarIcon} alt="icono calendario" className="preview-icon" />
        <h2 className="preview-title">Mi cita</h2>
      </div>

      <div className="preview-field">
        <label>Servicio</label>
        <p>{form.servicioNombre || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Placa</label>
        <p>{form.placa || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Marca</label>
        <p>{form.marca || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Modelo</label>
        <p>{form.modelo || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Fecha programada</label>
        <p>{form.programadaPara || "—"}</p>
      </div>
    </div>
  );
}
