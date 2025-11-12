// [Ruta del archivo: src/features/vehiculos/RegistrarVehiculoPagina.tsx]
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext";
// import { apiCitas } from "../mantenimientos/api"; // Lógica de precarga eliminada
import { apiVehiculos, VehiculoMin } from "./api"; // Asumo que apiVehiculos también fue actualizada
import "./registrarVehiculo.css";

type Rol = "ADMIN" | "MECANICO" | "CLIENTE";
// ADAPTACIÓN: Tipos en snake_case y con nueva estructura de 'usuario'
type UsuarioRolLite = { usuario_id: number; nombres: string; apellidos: string };
type MarcaVehiculo = { marca_vehiculo_id: number; nombre: string };
type ModeloVehiculo = { modelo_vehiculo_id: number; nombre: string };

// ADAPTACIÓN: El formulario ahora debe manejar IDs para marca y modelo
type FormVehiculo = {
  placa: string;
  marca_vehiculo_id?: number | ""; // CAMBIO: de string 'marca' a ID
  modelo_vehiculo_id?: number | ""; // CAMBIO: de string 'modelo' a ID
  anio?: number | "";
  color?: string;
  vin?: string;
  propietario_usuario_id?: number | ""; // CAMBIO: a snake_case
};

const ROLES_PERMITIDOS: Rol[] = ["MECANICO", "ADMIN"];
const REDIRECT_DELAY = 1200;
const BASE = import.meta.env.VITE_API_BASE_URL as string;

// ------- helpers HTTP locales -------
// ADVERTENCIA: Debes crear estos endpoints en tu backend.
// Asumo que están protegidos y son específicos del tenant (manejado por el token/schema)
async function getMarcas(token: string): Promise<MarcaVehiculo[]> {
  // Este endpoint no existe, es un ejemplo. Debes crearlo.
  // Debería consultar 'app.marca_vehiculo'
  const res = await fetch(`${BASE}/vehiculos/marcas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se cargaron marcas');
  return res.json();
}
async function getModelos(marca_id: number, token: string): Promise<ModeloVehiculo[]> {
  // Este endpoint no existe, es un ejemplo. Debes crearlo.
  // Debería consultar 'app.modelo_vehiculo'
  const res = await fetch(`${BASE}/vehiculos/modelos?marca_id=${marca_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se cargaron modelos');
  return res.json();
}

async function getUsuariosPorRol(
  rol: "CLIENTE",
  token?: string
): Promise<UsuarioRolLite[]> {
  // Asumo que este endpoint ya es consciente del tenant
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

  // ---------- Animaciones reveal (sin cambios) ----------
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
    marca_vehiculo_id: "", // CAMBIO
    modelo_vehiculo_id: "", // CAMBIO
    anio: "",
    color: "",
    vin: "",
    propietario_usuario_id: "", // CAMBIO
  });

  // ---------- Datos auxiliares ----------
  const [propietarios, setPropietarios] = useState<UsuarioRolLite[]>([]);
  const [cargandoProp, setCargandoProp] = useState(false);

  // NUEVO: Estado para marcas y modelos
  const [marcas, setMarcas] = useState<MarcaVehiculo[]>([]);
  const [modelos, setModelos] = useState<ModeloVehiculo[]>([]);
  const [cargandoMarcas, setCargandoMarcas] = useState(false);
  const [cargandoModelos, setCargandoModelos] = useState(false);

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

  // ADVERTENCIA: Lógica de precarga eliminada.
  // La nueva tabla 'cita' no tiene campos '...Preliminar'.
  // El flujo 'crearYEnlazarCita' ahora solo usa el 'citaId'
  // para obtener el 'cliente_usuario_id'. El resto de
  // datos del vehículo DEBEN ser ingresados en este formulario.
  useEffect(() => {
    if (citaId) {
      setBanner(`Registrando vehículo para la cita #${citaId}. Complete todos los campos.`);
    }
  }, [citaId]);

  // ---------- Cargar lista de propietarios (CLIENTE) ----------
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargandoProp(true);
        const lista = await getUsuariosPorRol("CLIENTE", usuario.token);
        const ordenada = [...lista].sort((a, b) =>
          (a.nombres || '').localeCompare(b.nombres || '')
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

  // ---------- NUEVO: Cargar Marcas ----------
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!usuario?.token) return;
      try {
        setCargandoMarcas(true);
        const lista = await getMarcas(usuario.token);
        if (!cancel) setMarcas(lista);
      } catch (e: any) {
        if (!cancel) setFormErr(e?.message || "Error cargando marcas");
      } finally {
        if (!cancel) setCargandoMarcas(false);
      }
    })();
    return () => { cancel = true; };
  }, [usuario?.token]);

  // ---------- NUEVO: Cargar Modelos cuando cambia Marca ----------
  useEffect(() => {
    let cancel = false;
    const marcaId = form.marca_vehiculo_id;
    (async () => {
      if (!usuario?.token || !marcaId) {
        setModelos([]); // Limpia modelos si no hay marca
        return;
      }
      try {
        setCargandoModelos(true);
        const lista = await getModelos(marcaId, usuario.token);
        if (!cancel) setModelos(lista);
      } catch (e: any) {
        if (!cancel) setFormErr(e?.message || "Error cargando modelos");
      } finally {
        if (!cancel) setCargandoModelos(false);
      }
    })();
    return () => { cancel = true; };
  }, [form.marca_vehiculo_id, usuario?.token]);

  // ---------- Validación ligera ----------
  const faltantes = useMemo(() => {
    const f: Record<string, string> = {};
    if (!form.placa.trim()) f["placa"] = "La placa es obligatoria.";
    if (!form.marca_vehiculo_id) f["marca_vehiculo_id"] = "La marca es obligatoria.";
    if (!form.modelo_vehiculo_id) f["modelo_vehiculo_id"] = "El modelo es obligatorio.";
    if (!form.anio) f["anio"] = "El año es obligatorio.";
    // si vengo desde una cita, el backend infiere propietario
    if (!citaId && !form.propietario_usuario_id) f["propietario_usuario_id"] = "Selecciona un propietario.";
    return f;
  }, [form, citaId]);

  // ---------- Handlers ----------
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let v: any = value;

    // Convertir a número si es necesario
    if (["anio", "propietario_usuario_id", "marca_vehiculo_id", "modelo_vehiculo_id"].includes(name)) {
      v = value === "" ? "" : Number(value);
    }

    setForm((s) => ({ ...s, [name]: v }));

    // Si cambian de marca, resetea el modelo
    if (name === "marca_vehiculo_id") {
      setForm((s) => ({ ...s, modelo_vehiculo_id: "" }));
    }

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

    // Principio: SRP (Single Responsibility Principle)
    // Este DTO (Data Transfer Object) se arma con la única
    // responsabilidad de empaquetar los datos del formulario
    // para enviarlos a la API en el formato que esta espera (snake_case, IDs).
    const dto = {
      placa: form.placa.trim().toUpperCase(),
      marca_vehiculo_id: Number(form.marca_vehiculo_id), // CAMBIO
      modelo_vehiculo_id: Number(form.modelo_vehiculo_id), // CAMBIO
      anio: Number(form.anio),
      color: form.color?.toString().trim() || undefined,
      vin: form.vin?.toString().trim() || undefined,
      // CAMBIO: snake_case y lógica
      propietario_usuario_id: form.propietario_usuario_id ? Number(form.propietario_usuario_id) : undefined,
    };

    try {
      setEnviando(true);

      const v: VehiculoMin = citaId
        ? await apiVehiculos.crearDesdeCita(citaId, dto as any, usuario.token) // 'as any' porque el DTO espera 'marca'
        : await apiVehiculos.crear(dto as any, usuario.token); // DEBES ACTUALIZAR 'apiVehiculos'

      // ... (resto del 'try' sin cambios) ...
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
  _**       });
      }, REDIRECT_DELAY);
      setForm({
        placa: "",
        marca_vehiculo_id: "",
        modelo_vehiculo_id: "",
        anio: "",
        color: "",
        vin: "",
        propietario_usuario_id: "",
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
          {/* cargandoPrelim ya no existe */}

          <form className="form" onSubmit={enviar} noValidate aria-busy={cargandoMarcas || cargandoProp}>
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

            {/* Marca (CAMBIADO A SELECT) */}
            <div className="form-group reveal">
              <label className="label" htmlFor="marca_vehiculo_id">Marca</label>
              <div className={`input-wrap ${fieldErr["marca_vehiculo_id"] ? "has-error" : ""}`}>
                <select
                  id="marca_vehiculo_id"
                  className="input"
                  name="marca_vehiculo_id"
                  value={form.marca_vehiculo_id}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["marca_vehiculo_id"]}
                  aria-describedby={fieldErr["marca_vehiculo_id"] ? "err-marca" : undefined}
                >
                  <option value="" disabled>
                    {cargandoMarcas ? "Cargando..." : "Seleccione marca..."}
                  </option>
                  {marcas.map((m) => (
                    <option key={m.marca_vehiculo_id} value={m.marca_vehiculo_id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErr["marca_vehiculo_id"] && <div id="err-marca" className="error-message" role="alert">{fieldErr["marca_vehiculo_id"]}</div>}
            </div>

            {/* Modelo (CAMBIADO A SELECT) */}
            <div className="form-group reveal">
              <label className="label" htmlFor="modelo_vehiculo_id">Modelo</label>
              <div className={`input-wrap ${fieldErr["modelo_vehiculo_id"] ? "has-error" : ""}`}>
                <select
                  id="modelo_vehiculo_id"
                  className="input"
                  name="modelo_vehiculo_id"
                  value={form.modelo_vehiculo_id}
                  onChange={onChange}
                  disabled={!form.marca_vehiculo_id || cargandoModelos}
                  aria-invalid={!!fieldErr["modelo_vehiculo_id"]}
                  aria-describedby={fieldErr["modelo_vehiculo_id"] ? "err-modelo" : undefined}
                >
                  <option value="" disabled>
                    {cargandoModelos ? "Cargando..." : (form.marca_vehiculo_id ? "Seleccione modelo..." : "Elija marca primero")}
                  </option>
                  {modelos.map((m) => (
                    <option key={m.modelo_vehiculo_id} value={m.modelo_vehiculo_id}>
                      {m.nombre}
                    </option>
                  ))}
          _**     </div>
              {fieldErr["modelo_vehiculo_id"] && <div id="err-modelo" className="error-message" role="alert">{fieldErr["modelo_vehiculo_id"]}</div>}
            </div>

            {/* Año (sin cambios) */}
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

            {/* Color (opcional) (sin cambios) */}
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
        _**     </div>
            </div>

            {/* VIN (opcional) (sin cambios) */}
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

            {/* Propietario (CAMBIADO A snake_case) */}
            <div className="form-group reveal">
              <label className="label" htmlFor="propietario_usuario_id">Propietario (Cliente)</label>
              <div className={`input-wrap ${fieldErr["propietario_usuario_id"] ? "has-error" : ""}`}>
                <select
                  id="propietario_usuario_id"
                  name="propietario_usuario_id"
                  className="input"
                  value={form.propietario_usuario_id ?? ""}
                  onChange={onChange}
                  aria-invalid={!!fieldErr["propietario_usuario_id"]}
                  aria-describedby={fieldErr["propietario_usuario_id"] ? "err-prop" : undefined}
                >
                  <option value="" disabled>
                    {cargandoProp ? "Cargando..." : "Seleccione propietario…"}
                  </option>
                  {propietarios.map((p) => (
                    <option key={p.usuario_id} value={p.usuario_id}>
                      {`${p.nombres} ${p.apellidos}`} (ID {p.usuario_id})
                    </option>
                  ))}
                </select>
              </div>
              {fieldErr["propietario_usuario_id"] && (
                <div id="err-prop" className="error-message" role="alert">
                  {fieldErr["propietario_usuario_id"]}
                </div>
              )}
              {citaId && (
                <div className="helper">
                  * Si vienes desde una cita, el propietario se tomará de la propia cita.
                </div>
              )}
            </div>

            <button type="submit" className="btn reveal" disabled={enviando || cargandoMarcas}>
              {enviando ? "Registrando…" : "Registrar vehículo"}
            </button>

            {/* ... (mensajes de error y éxito sin cambios) ... */}
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

          {/* ... (resto del archivo sin cambios) ... */}
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