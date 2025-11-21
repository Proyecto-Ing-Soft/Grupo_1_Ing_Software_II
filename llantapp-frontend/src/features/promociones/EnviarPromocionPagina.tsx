import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPromociones } from "./api";
import "./enviarPromocion.css";

export default function EnviarPromocionPagina() {
   const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  console.log("[EnviarPromocionPagina] render"); // para verificar que se monta

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setOkMsg(null);
    setErrorMsg(null);

    const tituloTrim = titulo.trim();
    const mensajeTrim = mensaje.trim();

    if (!tituloTrim || !mensajeTrim) {
      setErrorMsg("Completa título y mensaje antes de enviar.");
      return;
    }

    try {
      setEnviando(true);
      await apiPromociones.enviarPromocion({
        titulo: tituloTrim,
        mensaje: mensajeTrim,
      });
      setOkMsg("Promoción enviada a todos los clientes.");
      setTitulo("");
      setMensaje("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err?.message ||
          "Ocurrió un error al enviar la promoción. Intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="promo-page">
      <div className="promo-card">
        <h1 className="promo-title">Enviar promoción</h1>
        <p className="promo-sub">
          Envía un mensaje promocional a todos los clientes registrados en el sistema.
        </p>

        <button
          type="button"
          className="promo-backBtn"
          onClick={() => navigate("/inicio")}
        >
          ⬅️ Volver al inicio
        </button>

        <form className="promo-form" onSubmit={onSubmit}>
          <div className="promo-field">
            <label className="promo-label" htmlFor="promo-titulo">
              Título de la promoción
            </label>
            <input
              id="promo-titulo"
              className="promo-input"
              maxLength={120}
              placeholder="Ej. Descuento 10% en mantenimiento preventivo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="promo-field">
            <label className="promo-label" htmlFor="promo-mensaje">
              Mensaje
            </label>
            <textarea
              id="promo-mensaje"
              className="promo-textarea"
              rows={5}
              maxLength={1000}
              placeholder="Ej. Esta semana obtén 10% de descuento si reservas antes del viernes..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={enviando}
            />
            <div className="promo-helper">
              El mensaje se enviará como notificación interna a todos los clientes.
            </div>
          </div>

          {errorMsg && <div className="promo-error">{errorMsg}</div>}
          {okMsg && <div className="promo-success">{okMsg}</div>}

          <button
            type="submit"
            className="promo-submit"
            disabled={enviando || !titulo.trim() || !mensaje.trim()}
          >
            {enviando ? "Enviando…" : "Enviar promoción 💌"}
          </button>
        </form>
      </div>
    </main>
  );
}
