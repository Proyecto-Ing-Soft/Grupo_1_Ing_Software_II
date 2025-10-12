import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { esquemaRegistro } from "../../features/usuarios/usuarioSchemas";
import { apiAuth } from "../../features/autenticacion/api";
import { postJSON } from "../../core/http/_http";
import { Rol as RolApi } from "./api";

import HeaderPublico from "../../paginas/inicio-publico/HeaderPublico";

import "../../features/autenticacion/authRegister.css";
import "./authAuth.css";

import logo from "../../assets/img/logo.png";
import llontoppEsquina from "../../assets/img/llontopp.png";

import imgLoginCliente from "../../assets/registro/registro-cliente.png";
import imgLoginTaller from "../../assets/registro/registro-admin.png";
import imgLoginDefault from "../../assets/login/login-default.png";

type RolUi = "cliente" | "taller";
const ROL_MAP: Record<RolUi, RolApi> = { cliente: "CLIENTE", taller: "ADMIN" };
const esRolUi = (x: any): x is RolUi => x === "cliente" || x === "taller";

// --- helpers ---
function validarEmail(v: string){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function soloDigitos(v: string){ return /^[0-9]+$/.test(v); }

export default function RegistroPagina() {
  const params = useParams();
  const [q] = useSearchParams();
  const rolParam = params.rol || q.get("rol") || "cliente";
  const rolUi: RolUi = esRolUi(rolParam) ? rolParam : "cliente";
  const rolApi = ROL_MAP[rolUi];

  const fondoPorRol: Record<RolUi, string> = {
    cliente: imgLoginCliente,
    taller: imgLoginTaller,
  };
  const fondo = fondoPorRol[rolUi] || imgLoginDefault;

  return (
    <>
      <HeaderPublico />
      {rolUi === "cliente" ? (
        <RegistroCliente fondo={fondo} rolApi={rolApi} rolUi={rolUi} />
      ) : (
        <SolicitudTaller fondo={fondo} />
      )}
    </>
  );
}

// ===================== REGISTRO CLIENTE =====================

function RegistroCliente({
  fondo,
  rolApi,
  rolUi,
}: {
  fondo: string;
  rolApi: RolApi;
  rolUi: RolUi;
}) {
  const [form, setForm] = useState({ nombreCompleto: "", correo: "", clave: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  const LOGIN_PATH = `/login/${rolUi}`;
  const REDIRECT_DELAY = 1200;
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErr[e.target.name]) {
      const copy = { ...fieldErr };
      delete copy[e.target.name];
      setFieldErr(copy);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    setFieldErr({});

    // Validación con zod (incluye rol)
    const parsed = esquemaRegistro.safeParse({ ...form, rol: rolApi });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path?.[0] ?? "");
        if (k) fe[k] = issue.message;
      }
      setFieldErr(fe);
      setFormErr(Object.values(fe)[0] ?? "Datos inválidos.");
      return;
    }

    try {
      await apiAuth.registrar({ ...parsed.data, rol: rolApi });
      setOk(true);

      // redirige al login del rol correspondiente
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        navigate(`/login/${rolUi}`);
      }, REDIRECT_DELAY);
    } catch (err: any) {
      const msg =
        (err?.message && String(err.message)) ||
        "No se pudo completar el registro. Intenta nuevamente.";
      setFormErr(msg);
    }
  };


  const titulo = "Crear cuenta";
  const linkLogin = `/login/cliente`;

  return (
    <main className="auth-page auth-register auth-clone" style={{ paddingTop: 24 }}>

      <section
        className="auth-split card-azul"
        role="region"
        aria-label={`Formulario de registro (${rolUi})`}
      >
        <div className="auth-left">
          <div className="logo-wrap" aria-label="Marca LlantApp">
            <img src={logo} alt="LlantApp" />
            <span>LlantApp</span>
          </div>

          <h1 className="brand">{titulo}</h1>
          <p className="sub">Regístrate para empezar a gestionar tus vehículos y servicios.</p>

          <form className="form" onSubmit={enviar} noValidate>
            <div className="form-group">
              <label className="label" htmlFor="nombreCompleto">
                Nombre completo
              </label>
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

            <button type="submit" className="btn btn-cta">Registrarme</button>

            {formErr && (
              <div className="error-message" style={{ marginTop: 8 }} role="alert">
                {formErr}
              </div>
            )}
            {ok && (
              <div className="success-message" style={{ marginTop: 8 }} role="status">
                Registro exitoso. Ahora puedes iniciar sesión.
              </div>
            )}
          </form>

          <p className="helper">
            ¿Ya tienes cuenta?{" "}
            <Link to={linkLogin} className="textlink">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <aside
          className="auth-right"
          style={{
            backgroundImage: `url(${fondo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        >
          <img className="auth-right-bg" src={fondo} alt="" aria-hidden="true" />
          <div className="auth-right-inner">
            <h2 className="hero-title">Crea tu cuenta en segundos</h2>
            <div className="hero-pill">
              <span className="fa-solid fa-user-shield" aria-hidden="true" />
              <span>Perfiles por rol y trazabilidad</span>
            </div>
          </div>
        </aside>

        <img className="corner-mascot" src={llontoppEsquina} alt="Llontopp" aria-hidden="true" />
      </section>
    </main>
  );
}

// ===================== SOLICITUD TALLER =====================

function SolicitudTaller({ fondo }: { fondo: string }) {
  // Precios en soles (lista vs. oferta HOY)
  const PRECIO_INSTALACION_LISTA_S = 2500;
  const PRECIO_INSTALACION_HOY_S = 1990;

  const PRECIO_SOPORTE_MENSUAL_LISTA_S = 149;
  const PRECIO_SOPORTE_MENSUAL_HOY_S = 119;

  const PRECIO_SOPORTE_ANUAL_LISTA_S = 1490;
  const PRECIO_SOPORTE_ANUAL_HOY_S = 1190;

  const [data, setData] = React.useState({
    razonSocial: "",
    ruc: "",
    contactoNombre: "",
    contactoCorreo: "",
    telefono: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    numSedes: "",
    mensaje: "",
  });
  const [err, setErr] = React.useState<Record<string, string>>({});
  const [enviando, setEnviando] = React.useState(false);
  const [okMsg, setOkMsg] = React.useState<string | null>(null);
  const [failMsg, setFailMsg] = React.useState<string | null>(null);

  const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const soloDigitos = (v: string) => /^[0-9]+$/.test(v);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if ((prev => prev)(err)[name]) {
      const cp = { ...err };
      delete cp[name as keyof typeof cp];
      setErr(cp);
    }
  };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!data.razonSocial.trim()) e.razonSocial = "Ingresa la razón social.";
    if (!data.ruc || !soloDigitos(data.ruc) || data.ruc.length !== 11) e.ruc = "RUC inválido (11 dígitos).";
    if (!data.contactoNombre.trim()) e.contactoNombre = "Ingresa el nombre de contacto.";
    if (!validarEmail(data.contactoCorreo)) e.contactoCorreo = "Correo inválido.";
    if (!data.telefono.trim()) e.telefono = "Ingresa un teléfono de contacto (Perú).";
    if (!data.departamento.trim()) e.departamento = "Selecciona el departamento.";
    if (!data.ciudad.trim()) e.ciudad = "Ingresa la ciudad.";
    if (!data.direccion.trim()) e.direccion = "Ingresa la dirección.";
    if (data.numSedes && !soloDigitos(data.numSedes)) e.numSedes = "Solo números.";
    return e;
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setFailMsg(null);

    const ve = validar();
    if (Object.keys(ve).length) { setErr(ve); return; }

    setEnviando(true);
    try {
      await postJSON("/solicitudes", {
        ...data,
        pais: "Perú",
        fuente: "landing/registro-taller",
      });

      setOkMsg("¡Solicitud enviada! Te responderemos en ~24–48 h hábiles desde soporte.llantapp@gmail.com para coordinar tu onboarding.");

      // limpia
      setData({
        razonSocial: "",
        ruc: "",
        contactoNombre: "",
        contactoCorreo: "",
        telefono: "",
        departamento: "",
        ciudad: "",
        direccion: "",
        numSedes: "",
        mensaje: "",
      });
      setErr({});
    } catch (error: any) {
      setFailMsg(error?.message ? String(error.message) : "No se pudo enviar la solicitud. Intenta de nuevo en unos minutos.");
    } finally {
      setEnviando(false);
    }
  };

  const departamentosPeru = [
    "Amazonas","Áncash","Apurímac","Arequipa","Ayacucho","Cajamarca","Callao","Cusco","Huancavelica","Huánuco",
    "Ica","Junín","La Libertad","Lambayeque","Lima","Loreto","Madre de Dios","Moquegua","Pasco","Piura",
    "Puno","San Martín","Tacna","Tumbes","Ucayali"
  ];

  return (
    <main className="auth-page auth-register" style={{ paddingTop: 24 }}>

      {/* La sección completa pasa a ser el <form> para poder tener una fila que cruce ambas columnas */}
      <form
        className="auth-split solicitud-grid"
        role="region"
        aria-label="Solicitud de Taller"
        onSubmit={enviar}
        noValidate
      >
        <div className="auth-left">
          <div className="logo-wrap" aria-label="Marca LlantApp">
            <img src={logo} alt="LlantApp" />
            <span>LlantApp</span>
          </div>

          <h1 className="brand">¿Tienes un taller y quieres usar LlantApp?</h1>
          <p className="sub">
            El servicio está disponible <b>solo en Perú</b>. Déjanos tus datos; te contactaremos para configurar tu entorno.
          </p>

          {/* Funcionalidades + Precios (ordenado) */}
          <div className="pricing-card" aria-label="Precios y características de LlantApp para talleres">
            <div className="pricing-title">LlantApp para talleres incluye:</div>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
              <li>Recepción de vehículos con checklist y fotos</li>
              <li>Estados claros (programado, en proceso, listo) con notificaciones</li>
              <li>Historial por vehículo con evidencias y firmas</li>
              <li>Catálogo de servicios y asignación por mecánico</li>
              <li>Calificaciones de clientes y reportes básicos</li>
            </ul>

            <div className="pricing-rows" style={{ marginTop: 12 }}>
              <div className="pricing-row">
                <div className="price-now">Instalación (pago único): S/ {PRECIO_INSTALACION_HOY_S}*</div>
                <div className="price-old">S/ {PRECIO_INSTALACION_LISTA_S}</div>
                <span aria-hidden="true"></span>
                <div className="price-note">🤑 Oferta válida solo por HOY!!!!</div>
              </div>

              <div className="pricing-row">
                <span aria-hidden="true">•</span>
                <div className="price-now">Soporte mensual: S/ {PRECIO_SOPORTE_MENSUAL_HOY_S}/mes</div>
                <div className="price-old">S/ {PRECIO_SOPORTE_MENSUAL_LISTA_S}/mes</div></div>
              <div className="pricing-row">
                <span aria-hidden="true">•</span>
                <div className="price-now">Soporte anual: S/ {PRECIO_SOPORTE_ANUAL_HOY_S}/año</div>
                <div className="price-old">S/ {PRECIO_SOPORTE_ANUAL_LISTA_S}/año</div>
                <div className="price-note">Incluye actualizaciones y ayuda prioritaria</div>
              </div>
              <div className="pricing-row">
                <div className="price-note" id="letrapequena" >* Monto mínimo sujeto a cotización. Suele aumentar bastante.</div>
              </div>
            </div>
          </div>

          {/* Campos (excepto el comentario, que irá en la fila completa) */}
          <div className="form">
            {/* Empresa */}
            <div className="form-group">
              <label className="label" htmlFor="razonSocial">Razón social</label>
              <div className={`input-wrap ${err["razonSocial"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-building" aria-hidden="true" />
                <input id="razonSocial" name="razonSocial" className="input" placeholder="Mi Taller S.A.C." value={data.razonSocial} onChange={onChange} />
              </div>
              {err["razonSocial"] && <div className="error-message">{err["razonSocial"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="ruc">RUC (11 dígitos)</label>
              <div className={`input-wrap ${err["ruc"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-id-card" aria-hidden="true" />
                <input id="ruc" name="ruc" className="input" placeholder="20XXXXXXXXX" value={data.ruc} onChange={onChange} />
              </div>
              {err["ruc"] && <div className="error-message">{err["ruc"]}</div>}
            </div>

            {/* Contacto */}
            <div className="form-group">
              <label className="label" htmlFor="contactoNombre">Nombre de contacto</label>
              <div className={`input-wrap ${err["contactoNombre"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-user" aria-hidden="true" />
                <input id="contactoNombre" name="contactoNombre" className="input" placeholder="Nombre y apellido" value={data.contactoNombre} onChange={onChange} />
              </div>
              {err["contactoNombre"] && <div className="error-message">{err["contactoNombre"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="contactoCorreo">Correo de contacto</label>
              <div className={`input-wrap ${err["contactoCorreo"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-envelope" aria-hidden="true" />
                <input id="contactoCorreo" name="contactoCorreo" className="input" type="email" placeholder="correo@taller.com" value={data.contactoCorreo} onChange={onChange} />
              </div>
              {err["contactoCorreo"] && <div className="error-message">{err["contactoCorreo"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="telefono">Teléfono (Perú)</label>
              <div className={`input-wrap ${err["telefono"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-phone" aria-hidden="true" />
                <input id="telefono" name="telefono" className="input" placeholder="+51 9XX XXX XXX" value={data.telefono} onChange={onChange} />
              </div>
              {err["telefono"] && <div className="error-message">{err["telefono"]}</div>}
            </div>

            {/* Ubicación */}
            <div className="form-group">
              <label className="label" htmlFor="departamento">Departamento</label>
              <div className={`input-wrap ${err["departamento"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-location-dot" aria-hidden="true" />
                <select id="departamento" name="departamento" className="input" value={data.departamento} onChange={onChange}>
                  <option value="">Selecciona…</option>
                  {departamentosPeru.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              {err["departamento"] && <div className="error-message">{err["departamento"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="ciudad">Ciudad</label>
              <div className={`input-wrap ${err["ciudad"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-city" aria-hidden="true" />
                <input id="ciudad" name="ciudad" className="input" placeholder="Distrito / Provincia" value={data.ciudad} onChange={onChange} />
              </div>
              {err["ciudad"] && <div className="error-message">{err["ciudad"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="direccion">Dirección</label>
              <div className={`input-wrap ${err["direccion"] ? "has-error" : ""}`}>
                <span className="iconbox fa-solid fa-road" aria-hidden="true" />
                <input id="direccion" name="direccion" className="input" placeholder="Calle/Avenida y número" value={data.direccion} onChange={onChange} />
              </div>
              {err["direccion"] && <div className="error-message">{err["direccion"]}</div>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="numSedes">Número de sedes (opcional)</label>
              <div className={`input-wrap ${err["numSedes"] ? "has-error" : ""}`}>
                <span className="iconbox fa-regular fa-map" aria-hidden="true" />
                <input id="numSedes" name="numSedes" className="input" placeholder="1" value={data.numSedes} onChange={onChange} />
              </div>
              {err["numSedes"] && <div className="error-message">{err["numSedes"]}</div>}
            </div>
          </div>
        </div>

        <aside
          className="auth-right"
          style={{ backgroundImage: `url(${fondo})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
          aria-hidden="true"
        >
          <img className="auth-right-bg" src={fondo} alt="" aria-hidden="true" />
          <div className="auth-right-inner">
            <h2 className="hero-title">Onboarding de talleres</h2>
            <div className="hero-pill">
              <span className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
              <span>Configuración guiada + soporte</span>
            </div>
          </div>
        </aside>

        <div className="full-row">
          <div className="form-group">
            <label className="label" htmlFor="mensaje">Mensaje (opcional)</label>
            <div className="input-wrap">
              <span className="iconbox fa-regular fa-comment-dots" aria-hidden="true" />
              <textarea
                id="mensaje"
                name="mensaje"
                className="input"
                placeholder="Cuéntanos brevemente tus necesidades"
                value={data.mensaje}
                onChange={onChange}
                rows={4}
              />
            </div>
          </div>
          <br />
          <button type="submit" className="btn btn-cta" disabled={enviando}>
            {enviando ? "Enviando solicitud…" : "Enviar solicitud de taller"}
          </button>

          {okMsg && <div className="success-message" style={{ marginTop: 8 }} role="status">{okMsg}</div>}
          {failMsg && <div className="error-message" style={{ marginTop: 8 }} role="alert">{failMsg}</div>}

          <p className="helper" style={{ marginTop: 10 }}>
            También puedes escribirnos a{" "}
            <a className="textlink" href="mailto:soporte.llantapp@gmail.com">soporte.llantapp@gmail.com</a>{" "}
            <br />o llamar al <b>+51 915 060 423</b>.
          </p>
        </div>

        <img className="corner-mascot" src={llontoppEsquina} alt="Llontopp" aria-hidden="true" />
      </form>
    </main>
  );
}

