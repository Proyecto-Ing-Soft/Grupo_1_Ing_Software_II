import { Routes, Route } from "react-router-dom";
import Layout from "../componentes/Layout";
import PaginaPrincipal from "../paginas/PaginaPrincipal";
import ResultadosBusqueda from "../paginas/ResultadosBusqueda";
import DetalleProducto from "../paginas/DetalleProducto";
import Carrito from "../paginas/Carrito";
import Checkout from "../paginas/Checkout";
import Login from "../paginas/Login";
import Register from "../paginas/Register";
import RecuperarContraseña from "../paginas/RecuperarContraseña";
import DatosUsuario from "../paginas/EditarPerfil";
import ListadoCategoriasAdmin from "../paginas/ListadoCategoriasAdmin";
import AgregarCategoria from "../paginas/AgregarCategoria";
import CambiarPassword from "../paginas/CambiarPassword";
import AdminDashboard from "../paginas/AdminDashboard";
import AdminProductos from "../paginas/AdminProductos";
import AdminAgregarProducto from "../paginas/AdminAgregarProducto";
import AdminEditarProducto from "../paginas/AdminEditarProducto";
import CategoriaProductos from "../paginas/CategoriaProductos";
import Terminos from "../paginas/Terminos";
import Privacidad from "../paginas/Privacidad";
import Contacto from "../paginas/Contacto";
import ListaOrdenes from '../paginas/MiPerfil';
import DetalleOrden from '../paginas/DetalleOrden';
import ListaUsuariosAdmin from "../paginas/ListaUsuariosAdmin";
import DetalleUsuarioAdmin from "../paginas/DetalleUsuarioAdmin";
import ListaOrdenesAdmin from "../paginas/ListaOrdenesAdmin";
import DetalleOrdenAdmin from '../paginas/DetalleOrdenAdmin';
import PedidoCompletado from "../paginas/PedidoCompletado";




function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        <Route index element={<PaginaPrincipal />} />
        <Route path="buscar" element={<ResultadosBusqueda />} />
        <Route path="detalle/:id" element={<DetalleProducto />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="/pedido-completado" element={<PedidoCompletado />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="recuperar" element={<RecuperarContraseña />} />
        <Route path="usuario/datos" element={<DatosUsuario />} />
        <Route path="admin/categorias" element={<ListadoCategoriasAdmin />} />
        <Route path="admin/agregar-categoria" element={<AgregarCategoria />} />
        <Route path="usuario/password" element={<CambiarPassword />} />
        <Route path="/usuario/ordenes" element={<ListaOrdenes />} />
        <Route path="/usuario/orden/:id" element={<DetalleOrden />} />
        <Route path="categoria/:id" element={<CategoriaProductos />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/usuarios" element={<ListaUsuariosAdmin />} />
        <Route path="/admin/usuarios/:id" element={<DetalleUsuarioAdmin />} />
        <Route path="/admin/ordenes" element={<ListaOrdenesAdmin />} />
        <Route path="/admin/ordenes/:id" element={<DetalleOrdenAdmin />} />
        <Route path="admin/productos" element={<AdminProductos />} />
        <Route path="admin/productos/agregar" element={<AdminAgregarProducto />} />
        <Route path="admin/productos/editar/:id" element={<AdminEditarProducto />} />
        <Route path="terminos" element={<Terminos />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<h1>Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default Rutas;
