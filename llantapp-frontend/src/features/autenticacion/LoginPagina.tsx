import React, { useState, useEffect } from "react";
import { esquemaLogin } from "./usuarioSchemas";
import { useAuth } from "../../core/auth/AuthContext";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { Rol as RolApi } from "./api"
import "./authLogin.css";

import logo from "../../assets/img/logo.png";
import fondo from "../../assets/img/taller.jpeg";

type RolUi = "cliente" | "taller";

const ROL_MAP: Record<RolUi, RolApi> = {
  cliente: "CLIENTE",
  taller: "ADMIN",
};

const rolApiToUi = (r: RolApi): RolUi =>
  r === "ADMIN" ? "taller" : "cliente";

function esRolUi(x: any): x is RolUi {
  return x === "cliente" || x === "taller";
}

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
  // Rol UI desde /login/:rol o ?rol=
  const params = useParams();
  const [q] = useSearchParams();
  const rolParam = params.rol || q.get("rol") || "cliente";
  const rolUi: RolUi = esRolUi(rolParam) ? rolParam : "cliente";

  const [form, setForm] = useState({ correo: "", clave: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  const { iniciar, tieneRol, sesion } = useAuth();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        if (e.isIntersecting) el.classList.add("animate-in");
        else el.classList.remove("animate-in");
      }
    }, { threshold: 0.12 });

    nodes.forEach((n, i) => {
      n.dataset.reveal = String(Math.min(i + 1, 5));
      obs.observe(n);
    });

    return () => {
      window.clearTimeout(t);
      nodes.forEach(n => obs.unobserve(n));
      obs.disconnect();
    };
  }, []);

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
      setEnviando(true);
      await iniciar(form.correo, form.clave);

      // Verifica que el rol de la cuenta coincida con el acceso usado
      const esperado = ROL_MAP[rolUi];
      if (!tieneRol([esperado])) {
        const real = sesion.perfil?.rol;
        const sugerido = real ? rolApiToUi(real) : "cliente";
        setFormErr(
          real
            ? `Estás entrando por “${rolUi}”, pero tu cuenta es de tipo “${real}”. Ingresa por /login/${sugerido}.`
            : "No se pudo validar el rol de tu cuenta."
        );
        return;
      }

      navigate("/inicio");
    } catch (err) {
      setFormErr(await normalizarError(err));
    } finally {
      setEnviando(false);
    }
  };

  const titulo =
    rolUi === "taller" ? "Bienvenido Taller"
    : "Bienvenido Cliente";

  const linkRegistro = `/registro/${rolUi}`;

  return (
    <main className="auth-page">
      <section className="auth-split" role="region" aria-label={`Formulario de inicio de sesión (${rolUi})`}>
        <div className="auth-left">
          <div className="logo-wrap reveal" data-reveal="1">
            <img src={logo} alt="LlantApp" />
            <span className="logo-title">LlantApp</span>
          </div>

          <h1 className="brand reveal" data-reveal="2">{titulo}</h1>
          <p className="sub reveal" data-reveal="2">Ingresa tus credenciales para acceder a tu cuenta</p>

          <form className="form reveal" data-reveal="3" onSubmit={enviar} noValidate>
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
              {fieldErr["correo"] && <div id="err-correo" className="error-message">{fieldErr["correo"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="clave">Contraseña</label>
              <div className={`input-wrap ${fieldErr["clave"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-lock" aria-hidden="true" />
                <input
                  id="clave"
                  className="input"
                  name="clave"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={onChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} aria-hidden="true" />
                </button>
              </div>
              {fieldErr["clave"] && <div id="err-clave" className="error-message">{fieldErr["clave"]}</div>}
            </div>

            <button type="submit" className="btn" disabled={enviando}>
              {enviando ? "Ingresando…" : `Iniciar sesión (${rolUi})`}
            </button>
            {formErr && <div className="error-message" style={{ marginTop: 8 }}>{formErr}</div>}
          </form>

          <p className="helper reveal" data-reveal="4">
            ¿No tienes cuenta? <Link to={linkRegistro} className="textlink">Regístrate aquí</Link>
          </p>
        </div>

        <aside
          className="auth-right"
          style={{ backgroundImage: `url(${fondo})` }}
          aria-hidden="true"
        >
          <div className="auth-right-inner">
            <h2 className="hero-title reveal" data-reveal="1">Tu solución integral para neumáticos</h2>
            <div className="hero-pill reveal" data-reveal="2">
              <span className="fa-solid fa-truck" aria-hidden="true" />
              <span>Alertas automáticas de mantenimiento</span>
            </div>
          </div>

          <div className="bg-bubbles">
            <span></span><span></span><span></span>
          </div>
        </aside>
      </section>
    </main>
  );
}
