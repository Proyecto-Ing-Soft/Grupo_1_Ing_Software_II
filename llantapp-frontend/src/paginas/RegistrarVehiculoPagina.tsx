import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/proveedorestado/AuthContext";
import "../estilos/registrarVehiculo.css";

type Rol = "ADMIN" | "MECANICO" | "ASISTENTE" | "CHOFER" | "EMPRESA";
type UsuarioRolLite = { id: number; nombreCompleto: string };

type FormVehiculo = {
  placa: string;
  marca: string;
  modelo: string;
  anio?: number | "";
  color?: string;
  vin?: string;
  propietarioUsuarioId?: number | "";
};

const REDIRECT_DELAY = 1200;
const BASE = import.meta.env.VITE_API_BASE_URL as string;

async function getUsuariosPorRol(
  rol: "CHOFER" | "EMPRESA",
  token?: string
): Promise<UsuarioRolLite[]> {
  const res = await fetch(`${BASE}/usuarios?rol=${rol}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJSON<T>(url: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    try {
      const j = JSON.parse(txt);
      // NestJS ValidationPipe suele devolver { message: [...] } o string
      const msg = Array.isArray(j?.message) ? j.message.join(" | ") : (j?.message ?? txt);
      throw new Error(msg || `HTTP ${res.status}`);
    } catch {
      throw new Error(txt || `HTTP ${res.status}`);
    }
  }
  return res.json();
}

export default function RegistrarVehiculoPagina() {
  const navigate = useNavigate();
  const { usuario, tieneRol } = useAuth();
  const timeoutRef = useRef<number | null>(null);

  // Animaciones reveal (idéntico a Agendar Cita)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("animate-in");
          else e.target.classList.remove("animate-in");
        }
      },
      { threshold: 0.12 }
    );
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

  // Guard de rol
  useEffect(() => {
    if (!tieneRol(["ADMIN", "MECANICO"])) {
      navigate("/inicio", { replace: true });
    }
  }, [tieneRol, navigate]);

  const [form, setForm] = useState<FormVehiculo>({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    vin: "",
    propietarioUsuarioId: "",
  });

  const [propietarios, setPropietarios] = useState<UsuarioRolLite[]>([]);
  const [cargandoProp, setCargandoProp] = useState(false);
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Cargar choferes/empresas
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargandoProp(true);
        const [choferes, empresas] = await Promise.all([
          getUsuariosPorRol("CHOFER", usuario.token),
          getUsuariosPorRol("EMPRESA", usuario.token),
        ]);
        const lista = [...choferes, ...empresas].sort((a, b) =>
          a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        if (!cancel) setPropietarios(lista);
      } catch (e: any) {
        if (!cancel) setFormErr(e?.message || "Error cargando propietarios");
      } finally {
        if (!cancel) setCargandoProp(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [usuario?.token]);

  // Validación ligera (como la de Cita)
  const faltantes = useMemo(() => {
    const f: Record<string, string> = {};
    if (!form.placa.trim()) f["placa"] = "La placa es obligatoria.";
    if (!form.marca?.toString().trim()) f["marca"] = "La marca es obligatoria.";
    if (!form.modelo?.toString().trim()) f["modelo"] = "El modelo es obligatorio.";
    if (!form.anio) f["anio"] = "El año es obligatorio.";
    if (!form.propietarioUsuarioId) f["propietarioUsuarioId"] = "Selecciona un propietario.";
    return f;
  }, [form]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let v: any = value;
    if (name === "anio") v = value === "" ? "" : Number(value);
    if (name === "propietarioUsuarioId") v = value === "" ? "" : Number(value);
    setForm((s) => ({ ...s, [name]: v }));
    if (fieldErr[name]) {
      setFieldErr((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false); setFormErr(null);
    // valida mínimos
    if (Object.keys(faltantes).length) {
      setFieldErr(faltantes);
      setFormErr(Object.values(faltantes)[0]);
      return;
    }
    if (!usuario?.token) { setFormErr("Sesión inválida."); return; }

    const dto = {
      placa: form.placa.trim().toUpperCase(),
      marca: String(form.marca).trim(),
      modelo: String(form.modelo).trim(),
      anio: Number(form.anio),
      color: form.color?.toString().trim() || undefined,
      vin: form.vin?.toString().trim() || undefined,
      propietarioUsuarioId: Number(form.propietarioUsuarioId),
    };

    try {
      setEnviando(true);
      await postJSON(`${BASE}/vehiculos`, dto, usuario.token);
      setOk(true);
      timeoutRef.current = window.setTimeout(() => {
        navigate("/inicio", {
          replace: true,
          state: {
            flash: {
              type: "success",
              text: `Vehículo ${dto.placa} registrado correctamente.`,
              ttlMs: 4000,
            },
          },
        });
      }, REDIRECT_DELAY);
      // reset suave (mantén propietario si quieres; aquí lo limpiamos)
      setForm({
        placa: "",
        marca: "",
        modelo: "",
        anio: "",
        color: "",
        vin: "",
        propietarioUsuarioId: "",
      });
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : "No se pudo registrar el vehículo");
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <main className="registrar">
      <section className="registrar__split" role="region" aria-label="Formulario de registro de vehículo">
        <div className="registrar__left reveal">
          <h1 className="registrar__title">Registrar vehículo</h1>
          <p className="registrar__sub">
            Ingresa los datos del vehículo y el propietario asociado.
          </p>

          <form className="form" onSubmit={enviar} noValidate>
            {/* Placa */}
            <div className="form-group reveal">
              <label className="label" htmlFor="placa">Placa</label>
              <div className={`input-wrap ${fieldErr["placa"] ? "has-error" : ""}`}>
                <input
                  id="placa"
                  className="input"
                  name="placa"
                  type="text"
                  placeholder="ABC-123"
                  value={form.placa}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["placa"]}
                  aria-describedby={fieldErr["placa"] ? "err-placa" : undefined}
                />
              </div>
              {fieldErr["placa"] && <div id="err-placa" className="error-message" role="alert">{fieldErr["placa"]}</div>}
            </div>

            {/* Marca */}
            <div className="form-group reveal">
              <label className="label" htmlFor="marca">Marca</label>
              <div className={`input-wrap ${fieldErr["marca"] ? "has-error" : ""}`}>
                <input
                  id="marca"
                  className="input"
                  name="marca"
                  type="text"
                  placeholder="Toyota"
                  value={form.marca}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["marca"]}
                  aria-describedby={fieldErr["marca"] ? "err-marca" : undefined}
                />
              </div>
              {fieldErr["marca"] && <div id="err-marca" className="error-message" role="alert">{fieldErr["marca"]}</div>}
            </div>

            {/* Modelo */}
            <div className="form-group reveal">
              <label className="label" htmlFor="modelo">Modelo</label>
              <div className={`input-wrap ${fieldErr["modelo"] ? "has-error" : ""}`}>
                <input
                  id="modelo"
                  className="input"
                  name="modelo"
                  type="text"
                  placeholder="Yaris"
                  value={form.modelo}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["modelo"]}
                  aria-describedby={fieldErr["modelo"] ? "err-modelo" : undefined}
                />
              </div>
              {fieldErr["modelo"] && <div id="err-modelo" className="error-message" role="alert">{fieldErr["modelo"]}</div>}
            </div>

            {/* Año */}
            <div className="form-group reveal">
              <label className="label" htmlFor="anio">Año</label>
              <div className={`input-wrap ${fieldErr["anio"] ? "has-error" : ""}`}>
                <input
                  id="anio"
                  className="input"
                  name="anio"
                  type="number"
                  placeholder="2020"
                  min={1950}
                  max={new Date().getFullYear() + 1}
                  value={form.anio === "" ? "" : Number(form.anio)}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["anio"]}
                  aria-describedby={fieldErr["anio"] ? "err-anio" : undefined}
                />
              </div>
              {fieldErr["anio"] && <div id="err-anio" className="error-message" role="alert">{fieldErr["anio"]}</div>}
            </div>

            {/* Color (opcional) */}
            <div className="form-group reveal">
              <label className="label" htmlFor="color">Color (opcional)</label>
              <div className="input-wrap">
                <input
                  id="color"
                  className="input"
                  name="color"
                  type="text"
                  placeholder="Negro"
                  value={form.color ?? ""}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* VIN (opcional) */}
            <div className="form-group reveal">
              <label className="label" htmlFor="vin">VIN (opcional)</label>
              <div className="input-wrap">
                <input
                  id="vin"
                  className="input"
                  name="vin"
                  type="text"
                  placeholder="3N1CB51D54L123456"
                  value={form.vin ?? ""}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Propietario */}
            <div className="form-group reveal">
              <label className="label" htmlFor="propietarioUsuarioId">Propietario (Chofer/Empresa)</label>
              <div className={`input-wrap ${fieldErr["propietarioUsuarioId"] ? "has-error" : ""}`}>
                <select
                  id="propietarioUsuarioId"
                  name="propietarioUsuarioId"
                  className="input"
                  value={form.propietarioUsuarioId ?? ""}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["propietarioUsuarioId"]}
                  aria-describedby={fieldErr["propietarioUsuarioId"] ? "err-prop" : undefined}
                >
                  <option value="" disabled>
                    {cargandoProp ? "Cargando..." : "Seleccione propietario…"}
                  </option>
                  {propietarios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombreCompleto} (ID {p.id})
                    </option>
                  ))}
                </select>
              </div>
              {fieldErr["propietarioUsuarioId"] && (
                <div id="err-prop" className="error-message" role="alert">
                  {fieldErr["propietarioUsuarioId"]}
                </div>
              )}
            </div>

            <button type="submit" className="btn reveal" disabled={enviando}>
              {enviando ? "Registrando…" : "Registrar vehículo"}
            </button>

            {formErr && (
              <div className="error-message mt8 reveal" role="alert">
                {formErr}
              </div>
            )}
            {ok && (
              <div className="success-message mt8 reveal" role="status">
                Vehículo registrado. Redirigiendo…
              </div>
            )}
          </form>

          <p className="helper reveal">
            ¿Quieres salir?{" "}
            <span className="textlink" onClick={() => navigate("/inicio")}>
              Volver al inicio
            </span>
          </p>
        </div>

        <aside className="registrar__right reveal" aria-hidden="true">
          <div className="registrar__hero">
            <h2 className="registrar__heroTitle">Registro rápido y ordenado</h2>
            <div className="registrar__heroPill">
              <span aria-hidden>🚗</span>
              <span>Registra vehículos en minutos</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
