import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../estilos/DetalleOrdenAdmin.css';
import SidebarAdmin from "../componentes/SidebarAdmin";

const DetalleOrdenAdmin = () => {
  const { usuario } = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    if (!usuario || usuario.rol !== "admin") return;

    const fetchOrden = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/orden-admin/${id}`, {
          headers: {
            id_usuario: usuario.id_usuario,
            rol: usuario.rol
          }
        });
        const data = await res.json();
        setOrden(data);
      } catch (error) {
        console.error('Error al obtener detalle de orden:', error);
      }
    };

    fetchOrden();
  }, [id, usuario]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const cancelarOrden = async () => {
    if (!window.confirm("¿Estás seguro de que deseas cancelar esta orden?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/orden-admin/cancelar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          id_usuario: usuario.id_usuario,
          rol: usuario.rol
        }
      });
      const data = await res.json();
      alert(data.mensaje);
      navigate("/admin/ordenes");
    } catch (error) {
      console.error("Error al cancelar orden:", error);
    }
  };

  if (!orden) return <div className="detalle-orden-admin">Cargando...</div>;

  const estadoActual = orden.ESTADO_ORDEN?.nombre_estado;

  return (
    <div className="detalle-orden-admin">
      <SidebarAdmin />

      <h2>Detalle de Orden #{orden.id_orden}</h2>

      <section className="info-seccion">
        <h3>Información del Cliente</h3>
        <p><strong>Nombre:</strong> {orden.USUARIO?.nombre} {orden.USUARIO?.apellido}</p>
        <p><strong>Correo:</strong> {orden.USUARIO?.correo}</p>
        <p><strong>Dirección:</strong> {orden.DIRECCION?.direccion}, {orden.DIRECCION?.ciudad}, {orden.DIRECCION?.region}</p>
        <p><strong>Teléfono:</strong> {orden.DIRECCION?.telefono}</p>
      </section>

      <section className="info-seccion">
        <h3>Resumen de Orden</h3>
        <p><strong>Fecha:</strong> {formatearFecha(orden.fecha)}</p>
        <p><strong>Método de Envío:</strong> {orden.METODO_ENVIO?.nombre_envio}</p>
        <p><strong>Método de Pago:</strong> {orden.METODO_PAGO?.nombre_metodo}</p>
        <p><strong>Estado:</strong> {estadoActual}</p>
        <p><strong>Total:</strong> S/ {parseFloat(orden.total).toFixed(2)}</p>
      </section>

      <section className="info-seccion">
        <h3>Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orden.DETALLE_ORDENs?.map((item) => (
              <tr key={item.id_detalle}>
                <td data-label="Producto">{item.PRODUCTO?.sku}</td>
                <td data-label="Cantidad">{item.cantidad}</td>
                <td data-label="Precio">S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                <td data-label="Subtotal">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="boton-volver">
        <button onClick={() => navigate('/admin/ordenes')}>← Volver a listado</button>
        {(estadoActual !== "Cancelado" && estadoActual !== "Entregado") && (
          <button className="cancelar" onClick={cancelarOrden}>Cancelar Orden</button>
        )}
      </div>
    </div>
  );
};

export default DetalleOrdenAdmin;
