import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
import { apiCitas } from "../mantenimientos/api";
import { apiVehiculos, VehiculoMin, CrearVehiculoInput } from "./api";
import "./registrarVehiculo.css";

type Rol = "ADMIN" | "MECANICO" | "CLIENTE" | "OWNER";
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

const ROLES_PERMITIDOS: Rol[] = ["MECANICO", "ADMIN"];
const REDIRECT_DELAY = 1200;
const BASE = import.meta.env.VITE_API_BASE_URL as string;

// ------- helpers HTTP locales -------
async function getUsuariosPorRol(
  rol: "CLIENTE",
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

export default function RegistrarVehiculoPagina() {
  const navigate = useNavigate();
  const { usuario, tieneRol } = useAuth();
  const { state } = useLocation() as { state?: { citaId?: number } };
  const timeoutRef = useRef<number | null>(null);

  // ---------- Guard de rol ----------
  useEffect(() => {
    if (!tieneRol(ROLES_PERMITIDOS)) {
      navigate("/inicio", { replace: true });
    }
  }, [tieneRol, navigate]);

  // ---------- Animaciones reveal ----------
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const t = window.setTimeout(() => nodes.forEach(n => n.classList.add("will-animate")), 0);
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) (e.target as HTMLElement).classList.add("animate-in");
        else (e.target as HTMLElement).classList.remove("animate-in");
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

  // ---------- Estado del formulario ----------
  const [form, setForm] = useState<FormVehiculo>({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    vin: "",
    propietarioUsuarioId: "",
  });

  // ---------- Datos auxiliares ----------
  const [propietarios, setPropietarios] = useState<UsuarioRolLite[]>([]);
  const [cargandoProp, setCargandoProp] = useState(false);

  const [cargandoPrelim, setCargandoPrelim] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // ---------- Obtener citaId desde state o query ----------
  const citaIdFromState = state?.citaId;
  const citaIdFromQuery = (() => {
    try {
      const search = new URLSearchParams(window.location.search);
      const n = Number(search.get("cita") ?? "");
      return Number.isFinite(n) ? n : undefined;
    } catch {
      return undefined;
    }
  })();
  const citaId = citaIdFromState ?? citaIdFromQuery;

  // ---------- Precarga por cita ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!citaId) return;
      try {
        setCargandoPrelim(true);
        // adjunta token si tu apiCitas lo soporta
        const c = await (apiCitas as any).detalle?.(citaId, usuario?.token) ?? await apiCitas.detalle(citaId);

        const placa  = c.vehiculo?.placa  ?? c.placaPreliminar  ?? "";
        const marca  = c.vehiculo?.marca  ?? c.marcaPreliminar  ?? "";
        const modelo = c.vehiculo?.modelo ?? c.modeloPreliminar ?? "";
        const anio   = c.vehiculo?.anio   ?? c.anioPreliminar   ?? "";
        const color  = c.vehiculo?.color  ?? c.colorPreliminar  ?? "";
        const vin    = c.vehiculo?.vin    ?? c.vinPreliminar    ?? "";

        if (!alive) return;
        setForm(s => ({
          ...s,
          placa,
          marca,
          modelo,
          anio: (anio as any) ?? "",
          color: color ?? "",
          vin: vin ?? "",
          propietarioUsuarioId: (c.clienteId ?? s.propietarioUsuarioId) as any,
        }));
        setBanner(`Datos preliminares cargados de la cita #${c.id}. Revísalos y registra si están correctos.`);
      } catch {
        if (!alive) return;
        setBanner("No se pudieron cargar los datos preliminares de la cita. Completa manualmente.");
      } finally {
        if (alive) setCargandoPrelim(false);
      }
    })();
    return () => { alive = false; };
  }, [citaId, usuario?.token]);

  // ---------- Cargar lista de propietarios (CLIENTE) ----------
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargandoProp(true);
        const lista = await getUsuariosPorRol("CLIENTE", usuario.token);
        const ordenada = [...lista].sort((a, b) =>
          a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        if (!cancel) setPropietarios(ordenada);
      } catch (e: any) {
        if (!cancel) setFormErr(e?.message || "Error cargando propietarios");
      } finally {
        if (!cancel) setCargandoProp(false);
      }
    })();
    return () => { cancel = true; };
  }, [usuario?.token]);

  // ---------- Validación ligera ----------
  const faltantes = useMemo(() => {
    const f: Record<string, string> = {};
    if (!form.placa.trim()) f["placa"] = "La placa es obligatoria.";
    if (!String(form.marca).trim()) f["marca"] = "La marca es obligatoria.";
    if (!String(form.modelo).trim()) f["modelo"] = "El modelo es obligatorio.";
    if (!form.anio) f["anio"] = "El año es obligatorio.";
    // si vengo desde una cita, el backend infiere propietario con el cliente de la cita
    if (!citaId && !form.propietarioUsuarioId) f["propietarioUsuarioId"] = "Selecciona un propietario.";
    return f;
  }, [form, citaId]);

  // ---------- Handlers ----------
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let v: any = value;
    if (name === "anio") v = value === "" ? "" : Number(value);
    if (name === "propietarioUsuarioId") v = value === "" ? "" : Number(value);
    setForm((s) => ({ ...s, [name]: v }));
    if (fieldErr[name]) {
      setFieldErr((prev) => {
        const cp = { ...prev }; delete cp[name]; return cp;
      });
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false); setFormErr(null);

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
      propietarioUsuarioId: form.propietarioUsuarioId ? Number(form.propietarioUsuarioId) : undefined,
    };

    try {
      setEnviando(true);

      // usa apiVehiculos y captura el vehículo creado para redirigir al historial
      const v: VehiculoMin = citaId
        ? await apiVehiculos.crearDesdeCita(citaId, dto, usuario.token)
        : await apiVehiculos.crear(dto as any, usuario.token);

      setOk(true);
      timeoutRef.current = window.setTimeout(() => {
        navigate(`/inicio`, {
          replace: true,
          state: {
            flash: {
              type: "success",
              text: `Vehículo ${v.placa} registrado correctamente.`,
              ttlMs: 4000,
            },
          },
        });
      }, REDIRECT_DELAY);

      // reset suave
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

  // ---------- Render ----------
  return (
    <main className="registrar">
      <section className="registrar__split" role="region" aria-label="Formulario de registro de vehículo">
        <div className="registrar__left reveal">
          <h1 className="registrar__title">Registrar vehículo</h1>
          <p className="registrar__sub">Ingresa los datos del vehículo y el propietario asociado.</p>

          {banner && <div className="info-banner">{banner}</div>}
          {cargandoPrelim && <div className="helper">Cargando datos preliminares…</div>}

          <form className="form" onSubmit={enviar} noValidate aria-busy={cargandoPrelim}>
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
              <label className="label" htmlFor="propietarioUsuarioId">Propietario (Cliente)</label>
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
              {citaId && (
                <div className="helper">
                  * Si vienes desde una cita, el propietario se tomará de la propia cita.
                </div>
              )}
            </div>

            <button type="submit" className="btn reveal" disabled={enviando || cargandoPrelim}>
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