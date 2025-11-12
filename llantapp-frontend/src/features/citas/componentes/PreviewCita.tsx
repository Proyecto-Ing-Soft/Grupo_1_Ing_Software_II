import React from "react";
import "../previewCita.css";
import calendarIcon from "../../../assets/public/calendar-day.svg";

interface PreviewCitaProps {
  form: {
    placaPreliminar: string;
    marcaPreliminar: string;
    modeloPreliminar: string;
    programadaPara: string;
  };
}

export default function PreviewCita({ form }: PreviewCitaProps) {
  return (
    <div className="preview-cita">
      <div className="preview-header">
        <img src={calendarIcon} alt="icono calendario" className="preview-icon" />
        <h2 className="preview-title">Mi reserva</h2>
      </div>

      <div className="preview-field">
        <label>Placa</label>
        <p>{form.placaPreliminar || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Marca</label>
        <p>{form.marcaPreliminar || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Modelo</label>
        <p>{form.modeloPreliminar || "—"}</p>
      </div>

      <div className="preview-field">
        <label>Fecha programada</label>
        <p>{form.programadaPara || "—"}</p>
      </div>
    </div>
  );
}