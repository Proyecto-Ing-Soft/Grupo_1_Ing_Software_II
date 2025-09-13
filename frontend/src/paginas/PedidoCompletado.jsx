import React from "react";
import { useNavigate } from "react-router-dom";
import "../estilos/PedidoCompletado.css";

export default function PedidoCompletado() {
  const navigate = useNavigate();

  return (
    <div className="pedido-completado-container">
      <div className="pedido-completado-box">
        <div className="icono-check">✅</div>
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pedido ha sido registrado exitosamente.</p>
        <p>En breve recibirás un correo con el resumen de tu orden.</p>
        <p>Puedes ver el detalle de tu pedido en <b>Mi Cuenta → Mis Órdenes</b>.</p>

        <button className="btn-volver-inicio" onClick={() => navigate("/")}>
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
}
