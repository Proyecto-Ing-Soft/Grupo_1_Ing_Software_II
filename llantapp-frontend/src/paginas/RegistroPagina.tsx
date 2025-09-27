import React, { useState } from "react";
import { esquemaRegistro } from "../validaciones/usuarioSchemas";
import { apiAuth } from "../servicios/apiAuth";
import { Link } from "react-router-dom";
import "../estilos/authRegister.css";

import logo from "../imagenes/logo.jpg";
import fondo from "../imagenes/taller.jpeg";

export default function RegistroPagina() {
  const [form, setForm] = useState({ nombreCompleto: "", correo: "", clave: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErr[e.target.name]) {
      const copy = { ...fieldErr }; delete copy[e.target.name]; setFieldErr(copy);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false); setFormErr(null); setFieldErr({});
    const p = esquemaRegistro.safeParse(form);
    if (!p.success) {
      const fe: Record<string, string> = {};
      for (const issue of p.error.issues) {
        const k = String(issue.path?.[0] ?? "");
        if (k) fe[k] = issue.message;
      }
      setFieldErr(fe);
      setFormErr(Object.values(fe)[0] ?? "Datos inválidos");
      return;
    }
    try {
      await apiAuth.registrar(form);
      setOk(true);
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "No se pudo registrar");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-split" role="region" aria-label="Formulario de registro">
        {/* Izquierda: Logo + Form */}
        <div className="auth-left">
          <div className="logo-wrap" aria-label="Marca Llantapp">
            <img src={logo} alt="Llantapp" />
            <span>Llantapp</span>
          </div>

          <h1 className="brand">Crear cuenta</h1>
          <p className="sub">Regístrate para empezar a gestionar tus vehículos y servicios.</p>

          <form className="form" onSubmit={enviar} noValidate>
            {/* Nombre completo */}
            <div className="form-group">
              <label className="label" htmlFor="nombreCompleto">Nombre completo</label>
              <div className={`input-wrap ${fieldErr["nombreCompleto"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-user" aria-hidden="true" />
                <input
                  id="nombreCompleto"
                  className="input"
                  name="nombreCompleto"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.nombreCompleto}
                  onChange={onChange}
                  autoComplete="name"
                  aria-invalid={!!fieldErr["nombreCompleto"]}
                  aria-describedby={fieldErr["nombreCompleto"] ? "err-nombre" : undefined}
                />
              </div>
              {fieldErr["nombreCompleto"] && (
                <div id="err-nombre" className="error-message" role="alert">
                  {fieldErr["nombreCompleto"]}
                </div>
              )}
            </div>

            {/* Correo */}
            <div className="form-group">
              <label className="label" htmlFor="correo">Correo</label>
              <div className={`input-wrap ${fieldErr["correo"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-envelope" aria-hidden="true" />
                <input
                  id="correo"
                  className="input"
                  name="correo"
                  type="email"
                  placeholder="tucorreo@dominio.com"
                  value={form.correo}
                  onChange={onChange}
                  autoComplete="email"
                  aria-invalid={!!fieldErr["correo"]}
                  aria-describedby={fieldErr["correo"] ? "err-correo" : undefined}
                />
              </div>
              {fieldErr["correo"] && (
                <div id="err-correo" className="error-message" role="alert">
                  {fieldErr["correo"]}
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label className="label" htmlFor="clave">Contraseña</label>
              <div className={`input-wrap ${fieldErr["clave"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-lock" aria-hidden="true" />
                <input
                  id="clave"
                  className="input"
                  name="clave"
                  type="password"
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={onChange}
                  autoComplete="new-password"
                  aria-invalid={!!fieldErr["clave"]}
                  aria-describedby={fieldErr["clave"] ? "err-clave" : undefined}
                />
              </div>
              {fieldErr["clave"] && (
                <div id="err-clave" className="error-message" role="alert">
                  {fieldErr["clave"]}
                </div>
              )}
            </div>

            <button type="submit" className="btn">Registrarme</button>

            {formErr && <div className="error-message" style={{ marginTop: 8 }} role="alert">{formErr}</div>}
            {ok && <div className="success-message" style={{ marginTop: 8 }} role="status">
              Registro exitoso. Ahora puedes iniciar sesión.
            </div>}
          </form>

          <p className="helper">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="textlink">Inicia sesión aquí</Link>
          </p>
        </div>

        {/* Derecha: Imagen de fondo + texto */}
        <aside
          className="auth-right"
          style={{ backgroundImage: `url(${fondo})` }}
          aria-hidden="true"
        >
          <div className="auth-right-inner">
            <h2 className="hero-title">Crea tu cuenta en minutos</h2>
            <div className="hero-pill">
              <span className="fa-solid fa-user-shield" aria-hidden="true" />
              <span>Perfiles por rol y trazabilidad</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
