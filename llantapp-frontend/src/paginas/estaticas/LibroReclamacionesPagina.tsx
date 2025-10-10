import React, { useState } from "react";
import HeaderPublico from "../inicio-publico/HeaderPublico";
import "./css/libroReclamaciones.css";
import marcaLlontopp from "../../assets/public/landing/Llontopp.svg";

type FormState = {
  tipo: "reclamo" | "queja";
  nombres: string;
  apellidos: string;
  documentoTipo: "DNI" | "CE" | "Pasaporte";
  documento: string;
  email: string;
  telefono: string;
  placa: string;
  servicio: string;
  detalle: string;
  pedido: string;
  acepta: boolean;
};

export default function LibroReclamacionesPagina() {
  const [form, setForm] = useState<FormState>({
    tipo: "reclamo",
    nombres: "",
    apellidos: "",
    documentoTipo: "DNI",
    documento: "",
    email: "",
    telefono: "",
    placa: "",
    servicio: "",
    detalle: "",
    pedido: "",
    acepta: false,
  });
  const [errores, setErrores] = useState<Partial<Record<keyof FormState, string>>>({});
  const [enviado, setEnviado] = useState(false);
  const [codigo, setCodigo] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validar = () => {
    const err: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombres.trim()) err.nombres = "Obligatorio";
    if (!form.apellidos.trim()) err.apellidos = "Obligatorio";
    if (!form.documento.trim()) err.documento = "Obligatorio";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Correo inválido";
    if (!form.telefono.trim()) err.telefono = "Obligatorio";
    if (!form.detalle.trim()) err.detalle = "Describe el hecho";
    if (!form.pedido.trim()) err.pedido = "Indica tu pedido";
    if (!form.acepta) err.acepta = "Debes aceptar el tratamiento de datos";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    const cod = "LR-" + Date.now().toString().slice(-8);
    setCodigo(cod);
    setEnviado(true);
  };

  return (
    <>
      <HeaderPublico />
      <section className="container lr-hero">
        <div className="lr-hero-copy">
          <h2>Libro de reclamaciones</h2>
          <p>Registra tu reclamo o queja. Te responderemos conforme a la normativa vigente.</p>
        </div>
        <img src={marcaLlontopp} alt="" className="lr-brand" aria-hidden="true" />
      </section>

      <main className="container lr-main">
        {!enviado && (
          <form className="lr-form" onSubmit={onSubmit} noValidate>
            <section className="lr-card">
              <h3>Identificación del consumidor</h3>
              <div className="lr-grid">
                <div className="field">
                  <label htmlFor="nombres">Nombres <span className="req">*</span></label>
                  <input id="nombres" name="nombres" value={form.nombres} onChange={onChange} required />
                  {errores.nombres && <small className="error">{errores.nombres}</small>}
                </div>
                <div className="field">
                  <label htmlFor="apellidos">Apellidos <span className="req">*</span></label>
                  <input id="apellidos" name="apellidos" value={form.apellidos} onChange={onChange} required />
                  {errores.apellidos && <small className="error">{errores.apellidos}</small>}
                </div>
                <div className="field">
                  <label htmlFor="documentoTipo">Tipo de documento</label>
                  <select id="documentoTipo" name="documentoTipo" value={form.documentoTipo} onChange={onChange}>
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="documento">N° de documento <span className="req">*</span></label>
                  <input id="documento" name="documento" value={form.documento} onChange={onChange} required />
                  {errores.documento && <small className="error">{errores.documento}</small>}
                </div>
                <div className="field">
                  <label htmlFor="email">Correo electrónico <span className="req">*</span></label>
                  <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />
                  {errores.email && <small className="error">{errores.email}</small>}
                </div>
                <div className="field">
                  <label htmlFor="telefono">Teléfono <span className="req">*</span></label>
                  <input id="telefono" name="telefono" value={form.telefono} onChange={onChange} required />
                  {errores.telefono && <small className="error">{errores.telefono}</small>}
                </div>
              </div>
            </section>

            <section className="lr-card">
              <h3>Detalle del reclamo o queja</h3>
              <div className="field radio-group">
                <label>Tipo</label>
                <div className="radios">
                  <label className={`chip ${form.tipo === "reclamo" ? "active" : ""}`}>
                    <input type="radio" name="tipo" value="reclamo" checked={form.tipo === "reclamo"} onChange={onChange} />
                    Reclamo
                  </label>
                  <label className={`chip ${form.tipo === "queja" ? "active" : ""}`}>
                    <input type="radio" name="tipo" value="queja" checked={form.tipo === "queja"} onChange={onChange} />
                    Queja
                  </label>
                </div>
                <small className="hint">Reclamo: disconformidad relacionada al producto/servicio. <br /> Queja: malestar o descontento no relacionado al producto/servicio.</small>
                <br />
              </div>

              <div className="lr-grid">
                <div className="field">
                  <label htmlFor="placa">Placa del vehículo</label>
                  <input id="placa" name="placa" value={form.placa} onChange={onChange} placeholder="Opcional" />
                </div>
                <div className="field">
                  <label htmlFor="servicio">Servicio asociado</label>
                  <input id="servicio" name="servicio" value={form.servicio} onChange={onChange} placeholder="Ej. Alineación, cambio de aceite" />
                </div>
                <div className="field field-col-2">
                  <label htmlFor="detalle">Detalle de los hechos <span className="req">*</span></label>
                  <textarea id="detalle" name="detalle" rows={5} value={form.detalle} onChange={onChange} required />
                  {errores.detalle && <small className="error">{errores.detalle}</small>}
                </div>
                <div className="field field-col-2">
                  <label htmlFor="pedido">Pedido del consumidor <span className="req">*</span></label>
                  <textarea id="pedido" name="pedido" rows={4} value={form.pedido} onChange={onChange} required />
                  {errores.pedido && <small className="error">{errores.pedido}</small>}
                </div>
              </div>

              <div className="field check">
                <label className="checkline">
                  <input type="checkbox" name="acepta" checked={form.acepta} onChange={onChange} />
                  Acepto el tratamiento de mis datos personales para la atención del reclamo.
                </label>
                {errores.acepta && <small className="error">{errores.acepta}</small>}
              </div>
            </section>

            <div className="lr-actions">
              <button type="submit" className="btn btn-solid">Enviar</button>
              <a href="/llantapp/" className="btn btn-alt">Cancelar</a>
            </div>

            <p className="lr-legal">Este registro es gratuito. Conserva el código de registro para dar seguimiento.</p>
          </form>
        )}

        {enviado && (
          <section className="lr-success">
            <div className="lr-success-inner">
              <div className="code">{codigo}</div>
              <h3>Registro recibido</h3>
              <p>Hemos recibido tu {form.tipo}. Te contactaremos al correo indicado. Si necesitas adjuntar evidencia, respóndenos cuando te escribamos.</p>
              <div className="lr-actions">
                <a href="/llantapp/" className="btn btn-solid">Volver al inicio</a>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
