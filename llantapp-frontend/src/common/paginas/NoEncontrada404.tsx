import { Link, useLocation } from "react-router-dom";
import "./estilos/noEncontrada404.css";
import img404 from "../../assets/err/404.png";

function distancia(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + costo
      );
    }
  }
  return dp[m][n];
}

type RutaConocida = { ruta: string; nombre: string };

const RUTAS_CONOCIDAS: RutaConocida[] = [
  { ruta: "/", nombre: "Inicio" },
  { ruta: "/solicitudes", nombre: "Solicitar servicio" },
  { ruta: "/mantenimientos/agendar", nombre: "Agendar cita" },
  { ruta: "/vehiculos/mios", nombre: "Mis vehículos" },
  { ruta: "/notificaciones", nombre: "Notificaciones" },
  { ruta: "/historial", nombre: "Historial de servicios" },
  { ruta: "/catalogo-servicios", nombre: "Catálogo de servicios" },
  { ruta: "/auth/login", nombre: "Iniciar sesión" },
  { ruta: "/auth/registro", nombre: "Crear cuenta" },
];

function sugerirRuta(pathActual: string): RutaConocida {
  let mejor = RUTAS_CONOCIDAS[0];
  let mejorScore = distancia(pathActual, mejor.ruta);
  for (const r of RUTAS_CONOCIDAS.slice(1)) {
    const d = distancia(pathActual, r.ruta);
    if (d < mejorScore) {
      mejor = r;
      mejorScore = d;
    }
  }
  return mejor;
}

export default function NoEncontrada404() {
  const ubicacion = useLocation();
  const sugerida = sugerirRuta(ubicacion.pathname);

  return (
    <main className="p404">
      <div className="p404__contenedor">
        <div className="p404__izquierda">
          <img className="p404__imagen" src={img404} alt="Error 404 - No encontrado" />
        </div>

        <div className="p404__derecha">
          <h1 className="p404__ups">Ups…</h1>
          <p className="p404__mensaje">Pipipi... Esta página no existe :c</p>

          <p className="p404__sugerencia">
            ¿Quisiste visitar <Link to={sugerida.ruta} className="p404__link">«{sugerida.nombre}»</Link> en su lugar?
          </p>

          <div className="p404__acciones">
            <Link to="/" className="p404__boton">Volver al inicio</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
