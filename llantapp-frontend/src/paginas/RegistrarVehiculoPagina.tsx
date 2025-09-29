// src/paginas/RegistrarVehiculoPagina.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/proveedorestado/AuthContext";

/**
 * RegistrarVehiculoPagina
 *
 * Objetivo (CU-00): Registrar un vehículo a nombre de un CHOFER o EMPRESA,
 * con validaciones y auditoría del creador (ADMIN o MECÁNICO).
 *
 * Principios/patrones reflejados en este componente:
 * - KISS: lógica del form simple; helpers locales mínimos para fetch.
 * - Ley de Demeter: este componente solo "habla" con AuthContext y con la API.
 * - Cohesión alta: solo UI/UX + orquestar envío; la lógica de negocio vive en el backend.
 * - Facade: AuthContext expone perfil/token (oculta refresh/decoding).
 * - DRY: reuso de helpers (postJSON, getUsuariosPorRol).
 * - Seguridad por capas: la ruta está protegida por rol (rutas.tsx)
 *   y el backend refuerza autorización con RolesGuard + @RolRequerido.
 *
 * Relación con diagrama de secuencia (CU-00):
 * UI (este form) → POST /vehiculos → Controller → Service → [Validadores] → Prisma.create → 201/400.
 */

type Rol = "ADMIN" | "MECANICO" | "ASISTENTE" | "CHOFER" | "EMPRESA";

type UsuarioRolLite = { id: number; nombreCompleto: string };

type FormVehiculo = {
  placa: string;
  marca: string;
  modelo: string;
  anio: string; // lo guardamos como string para controlar input number
  color: string;
  vin?: string;
  propietarioUsuarioId?: number;
};

const BASE = import.meta.env.VITE_API_BASE_URL as string;

// ==== Helpers HTTP (KISS/DRY) ====
async function postJSON<T>(
  url: string,
  body: unknown,
  token?: string
): Promise<T> {
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
    // intentamos leer mensaje útil del backend
    const txt = await res.text().catch(() => "");
    let msg = txt || `HTTP ${res.status}`;
    // Nest ValidationPipe suele responder JSON con message[]
    try {
      const j = JSON.parse(txt);
      if (Array.isArray(j?.message)) msg = j.message.join(" | ");
      if (j?.message && typeof j.message === "string") msg = j.message;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  return res.json();
}

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

export default function RegistrarVehiculoPagina() {
  const { usuario, tieneRol } = useAuth();
  const navigate = useNavigate();

  // Bloqueo defensivo: si se llega sin rol válido, redirigir (UI cohesiva con reglas de rutas)
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
    propietarioUsuarioId: undefined,
  });

  const [propietarios, setPropietarios] = useState<UsuarioRolLite[]>([]);
  const [cargandoProp, setCargandoProp] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Cargar lista de propietarios (CHOFER + EMPRESA)
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!usuario?.token) return;
      setCargandoProp(true);
      setError(null);
      try {
        const [choferes, empresas] = await Promise.all([
          getUsuariosPorRol("CHOFER", usuario.token),
          getUsuariosPorRol("EMPRESA", usuario.token),
        ]);
        const lista = [...choferes, ...empresas].sort((a, b) =>
          a.nombreCompleto.localeCompare(b.nombreCompleto)
        );
        if (!cancel) setPropietarios(lista);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Error cargando propietarios");
      } finally {
        if (!cancel) setCargandoProp(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [usuario?.token]);

  // Validación rápida en el cliente (KISS) para UX, el backend valida oficialmente (SSOT)
  const faltantes = useMemo(() => {
    const f: string[] = [];
    if (!form.placa.trim()) f.push("placa");
    if (!form.marca.trim()) f.push("marca");
    if (!form.modelo.trim()) f.push("modelo");
    if (!form.anio.trim()) f.push("anio");
    if (!form.color.trim()) f.push("color");
    if (!form.propietarioUsuarioId) f.push("propietario");
    return f;
  }, [form]);

  const onChange =
    (name: keyof FormVehiculo) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        name === "propietarioUsuarioId" ? Number(e.target.value) : e.target.value;
      setForm((s) => ({ ...s, [name]: value }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    if (!usuario?.token) {
      setError("Sesión no válida.");
      return;
    }
    if (faltantes.length) {
      setError(
        `Faltan: ${faltantes.join(
          ", "
        )}. (El servidor también validará formato/placa única)`
      );
      return;
    }
    // Ensamble DTO del backend (respetando tipos)
    const dto = {
      placa: form.placa.trim().toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      anio: Number(form.anio),
      color: form.color.trim(),
      vin: form.vin?.trim() || undefined,
      propietarioUsuarioId: form.propietarioUsuarioId!, // requerido
    };

    setEnviando(true);
    try {
      // POST /vehiculos (RolesGuard en backend permite ADMIN/MECANICO)
      await postJSON(`${BASE}/vehiculos`, dto, usuario.token);
      setOkMsg(`Vehículo ${dto.placa} registrado correctamente.`);
      // Reset suave manteniendo propietario seleccionado (opcional)
      setForm((s) => ({
        ...s,
        placa: "",
        marca: "",
        modelo: "",
        anio: "",
        color: "",
        vin: "",
      }));
    } catch (e: any) {
      setError(e?.message || "No se pudo registrar el vehículo");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <h1>Registrar vehículo</h1>
        {usuario && (
          <span className={`rol-badge rol-${usuario.rol.toLowerCase()}`}>
            👤 {usuario.nombreCompleto} | Rol: {usuario.rol}
          </span>
        )}
      </header>

      <form className="card" onSubmit={submit} noValidate>
        <h2>Datos del vehículo</h2>

        <div className="perfil-grid" style={{ marginTop: 8 }}>
          <div className="perfil-item">
            <label className="label">Placa (ABC-123)</label>
            <input
              className="input"
              placeholder="ABC-123"
              value={form.placa}
              onChange={onChange("placa")}
              required
            />
          </div>

          <div className="perfil-item">
            <label className="label">Marca</label>
            <input
              className="input"
              placeholder="Toyota"
              value={form.marca}
              onChange={onChange("marca")}
              required
            />
          </div>

          <div className="perfil-item">
            <label className="label">Modelo</label>
            <input
              className="input"
              placeholder="Yaris"
              value={form.modelo}
              onChange={onChange("modelo")}
              required
            />
          </div>

          <div className="perfil-item">
            <label className="label">Año</label>
            <input
              className="input"
              type="number"
              min={1950}
              max={new Date().getFullYear() + 1}
              placeholder="2020"
              value={form.anio}
              onChange={onChange("anio")}
              required
            />
          </div>

          <div className="perfil-item">
            <label className="label">Color</label>
            <input
              className="input"
              placeholder="Negro"
              value={form.color}
              onChange={onChange("color")}
              required
            />
          </div>

          <div className="perfil-item">
            <label className="label">VIN (opcional)</label>
            <input
              className="input"
              placeholder="3N1CB51D54L123456"
              value={form.vin}
              onChange={onChange("vin")}
            />
          </div>

          <div className="perfil-item" style={{ gridColumn: "span 12" }}>
            <label className="label">Propietario (Chofer/Empresa)</label>
            <select
              className="input"
              value={form.propietarioUsuarioId ?? ""}
              onChange={onChange("propietarioUsuarioId")}
              required
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
            <small className="helper">
              El vehículo quedará asociado al propietario seleccionado. La
              auditoría registrará que tú lo creaste.
            </small>
          </div>
        </div>

        {/* Estado UX */}
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
        {okMsg && (
          <div className="success-message" style={{ marginTop: 10 }}>
            {okMsg}
          </div>
        )}

        <div className="acciones" style={{ marginTop: 14 }}>
          <button className="btn-primary" type="submit" disabled={enviando}>
            {enviando ? "Registrando..." : "Registrar vehículo"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/inicio")}
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
