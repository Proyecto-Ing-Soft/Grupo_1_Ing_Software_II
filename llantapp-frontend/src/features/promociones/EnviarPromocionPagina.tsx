import { useNavigate } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import { apiPromociones, apiUsuarios, UsuarioItem } from "./api";
import FormularioEnviarPromocion from "./componentes/FormularioEnviarPromocion";
import "./enviarPromocion.css";

export default function EnviarPromocionPagina() {
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  useEffect(() => {
    async function load() {
      setCargandoUsuarios(true);
      try {
        const lista = await apiUsuarios.listarClientes();
        setUsuarios(lista);
      } finally {
        setCargandoUsuarios(false);
      }
    }
    load();
  }, []);

  function toggleUsuario(id: number) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleTodos() {
    if (seleccionados.length === usuarios.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(usuarios.map((u) => u.id));
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // VALIDACIÓN 1: título/mensaje faltantes
    if (!titulo.trim() || !mensaje.trim()) {
      setErrorMsg("Completa título y mensaje");
      return;
    }

    // VALIDACIÓN 2: fechas inválidas
    if (!inicio || !fin || fin < inicio) {
      setFechaInvalida(true);
      return;
    }

    // VALIDACIÓN 3: destinatarios vacíos
    if (seleccionados.length === 0) {
      setErrorMsg("Debes seleccionar al menos un destinatario.");
      return;
    }

    // SI PASÓ TODAS LAS VALIDACIONES → limpiar errores
    setErrorMsg(null);
    setOkMsg(null);
    setFechaInvalida(false);

    const mensajeFinal = `${mensaje.trim()}. Válido del ${inicio} al ${fin}`;

    try {
      setEnviando(true);

      await apiPromociones.enviarPromocion({
        titulo: titulo.trim(),
        mensaje: mensajeFinal,
        usuarios: seleccionados.length ? seleccionados : undefined,
      });

      setOkMsg("Promoción enviada.");
      setTitulo("");
      setMensaje("");
      setInicio("");
      setFin("");
      setSeleccionados([]);

    } catch (err: any) {
      setErrorMsg(err?.message ?? "Error enviando promoción.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="promo-page">
      <div className="promo-card">

        <h1 className="promo-title">Enviar promoción</h1>
        <p className="promo-sub">
          Envía una promoción a todos o algunos clientes registrados.
        </p>

        {/* El formulario ya contiene su propio layout de dos columnas */}
        <FormularioEnviarPromocion
          titulo={titulo}
          mensaje={mensaje}
          inicio={inicio}
          fin={fin}
          fechaInvalida={fechaInvalida}
          enviando={enviando}
          usuarios={usuarios}
          seleccionados={seleccionados}
          cargandoUsuarios={cargandoUsuarios}
          okMsg={okMsg}
          errorMsg={errorMsg}
          setTitulo={setTitulo}
          setMensaje={setMensaje}
          setInicio={setInicio}
          setFin={setFin}
          toggleUsuario={toggleUsuario}
          toggleTodos={toggleTodos}
          onSubmit={onSubmit}
        />

      </div>
    </main>
  );
}