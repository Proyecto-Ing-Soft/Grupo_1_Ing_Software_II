import React, { useState } from "react";
import { esquemaLogin } from "../validaciones/usuarioSchemas";
import { useAuth } from "../app/proveedorestado/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../estilos/authLogin.css";

import logo from "../imagenes/logo.jpg";
import fondo from "../imagenes/taller.jpeg";

/** Helpers de error (igual lógica que tu versión) */
function parseJsonish(s: string) { try { return JSON.parse(s); } catch { return null; } }
async function normalizarError(e: unknown): Promise<string> {
  if (e instanceof Response) {
    let data: any = null;
    try { data = await e.clone().json(); } catch {}
    if (e.status === 401) return "Correo o contraseña incorrectos.";
    if (e.status === 400) return data?.message || "Datos inválidos.";
    if (e.status >= 500) return "Servidor no disponible. Intenta más tarde.";
    return data?.message || "No se pudo iniciar sesión.";
  }
  if (e instanceof Error) {
    const data = parseJsonish(e.message);
    if (data) {
      if (data.statusCode === 401) return "Correo o contraseña incorrectos.";
      return data.message || "No se pudo iniciar sesión.";
    }
    return e.message || "No se pudo iniciar sesión.";
  }
  if (e && typeof e === "object" && "message" in (e as any)) {
    const data: any = e as any;
    if (data.statusCode === 401) return "Correo o contraseña incorrectos.";
    return String(data.message || "No se pudo iniciar sesión.");
  }
  return "Ocurrió un error inesperado.";
}

export default function LoginPagina() {
  const [form, setForm] = useState({ correo: "", clave: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const { iniciar } = useAuth();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErr[e.target.name]) {
      const copy = { ...fieldErr }; delete copy[e.target.name]; setFieldErr(copy);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null); setFieldErr({});
    const p = esquemaLogin.safeParse(form);
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
      await iniciar(form.correo, form.clave);
      navigate("/inicio");
    } catch (err) {
      setFormErr(await normalizarError(err));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-split" role="region" aria-label="Formulario de inicio de sesión">
        {/* Izquierda: Logo + Form */}
        <div className="auth-left">
          <div className="logo-wrap" aria-label="Marca Llantapp">
            <img src={logo} alt="Llantapp" />
            <span>Llantapp</span>
          </div>

          <h1 className="brand">Bienvenido de nuevo</h1>
          <p className="sub">Ingresa tus credenciales para acceder a tu cuenta</p>

          <form className="form" onSubmit={enviar} noValidate>
            {/* Correo */}
            <div className="form-group">
              <label className="label" htmlFor="correo">Correo electrónico</label>
              <div className={`input-wrap ${fieldErr["correo"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-envelope" aria-hidden="true" />
                <input
                  id="correo"
                  className="input"
                  name="correo"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.correo}
                  onChange={onChange}
                  autoComplete="username"
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
                  autoComplete="current-password"
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

            <button type="submit" className="btn">Iniciar sesión</button>
            {formErr && <div className="error-message" style={{ marginTop: 8 }} role="alert">{formErr}</div>}
          </form>

          <p className="helper">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="textlink">Regístrate aquí</Link>
          </p>
        </div>

        {/* Derecha: Imagen de fondo + texto */}
        <aside
          className="auth-right"
          style={{ backgroundImage: `url(${fondo})` }}
          aria-hidden="true"
        >
          <div className="auth-right-inner">
            <h2 className="hero-title">Tu solución integral para neumáticos</h2>
            <div className="hero-pill">
              <span className="fa-solid fa-truck" aria-hidden="true" />
              <span>Envío gratuito en compras superiores a $100</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
