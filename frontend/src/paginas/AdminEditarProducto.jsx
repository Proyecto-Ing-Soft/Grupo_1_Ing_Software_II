import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { obtenerParametros } from "../servicios/apiParametros";
import { UserContext } from "../context/UserContext";
import "../estilos/AdminProductos.css";
import SidebarAdmin from "../componentes/SidebarAdmin";

export default function AdminEditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);

  const [form, setForm] = useState({
    sku: "",
    descripcion_camiseta: "",
    precio: "",
    stock: "",
    imagen_url: "",
    id_equipo: "",
    id_temporada: "",
    id_categoria: "",
    id_marca: "",
    id_tipo_camiseta: "",
    id_genero: "",
    id_talla: ""
  });

  const [categorias, setCategorias] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [tiposCamiseta, setTiposCamiseta] = useState([]);
  const [temporadas, setTemporadas] = useState([]);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resCategorias = await fetch("http://localhost:3000/api/categoria");
        const categoriasData = await resCategorias.json();
        setCategorias(categoriasData);

        const {
          equipos,
          tallas,
          generos,
          marcas,
          tiposCamiseta,
          temporadas
        } = await obtenerParametros();
        setEquipos(equipos);
        setTallas(tallas);
        setGeneros(generos);
        setMarcas(marcas);
        setTiposCamiseta(tiposCamiseta);
        setTemporadas(temporadas);

        // Cargar producto por ID
        const res = await fetch(`http://localhost:3000/api/producto/${id}`);
        const producto = await res.json();

        setForm({
          sku: producto.sku,
          descripcion_camiseta: producto.CAMISETum?.descripcion_camiseta || "",
          precio: producto.precio,
          stock: producto.stock,
          imagen_url: producto.CAMISETum?.imagen_url || "",
          id_equipo: producto.CAMISETum?.id_equipo || "",
          id_temporada: producto.CAMISETum?.id_temporada || "",
          id_categoria: producto.CAMISETum?.id_categoria || "",
          id_marca: producto.CAMISETum?.id_marca || "",
          id_tipo_camiseta: producto.CAMISETum?.id_tipo_camiseta || "",
          id_genero: producto.id_genero,
          id_talla: producto.id_talla
        });
      } catch (error) {
        alert("Error al cargar datos");
      }
    }

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prod = {
      ...form,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10)
    };

    try {
      const res = await fetch(`http://localhost:3000/api/producto/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          id_usuario: usuario.id_usuario,
          rol: usuario.rol
        },
        body: JSON.stringify(prod)
      });

      if (!res.ok) throw new Error("Error al actualizar");

      await res.json();
      navigate("/admin/productos");
    } catch (error) {
      alert("Error al editar producto");
    }
  };

  return (
    <div className="admin-productos-bg">
      <SidebarAdmin />

      <div className="admin-productos-overlay">
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="admin-productos-header"
        >
          <h1>Editar Producto</h1>
          <p>Modifica los campos del producto</p>
        </motion.header>

        <motion.form
          className="admin-productos-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="form-row">
            <label>SKU</label>
            <input type="text" name="sku" value={form.sku} readOnly
              style={{
                background: "#eeeeeeff",
                cursor: "not-allowed",
              }} />
            <label>Descripción</label>
            <input type="text" name="descripcion_camiseta" value={form.descripcion_camiseta} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Precio</label>
            <input type="number" min="0" step="0.01" name="precio" value={form.precio} onChange={handleChange} required />
            <label>Stock</label>
            <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Imagen URL</label>
            <input type="text" name="imagen_url" value={form.imagen_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-row">
            <label>Equipo</label>
            <select name="id_equipo" value={form.id_equipo} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {equipos.map(e => <option key={e.id_equipo} value={e.id_equipo}>{e.nombre_equipo}</option>)}
            </select>
            <label>Temporada</label>
            <select name="id_temporada" value={form.id_temporada} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {temporadas.map(t => <option key={t.id_temporada} value={t.id_temporada}>{t.descripcion_temporada}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Categoría</label>
            <select name="id_categoria" value={form.id_categoria} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
            </select>
            <label>Marca</label>
            <select name="id_marca" value={form.id_marca} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Tipo Camiseta</label>
            <select name="id_tipo_camiseta" value={form.id_tipo_camiseta} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {tiposCamiseta.map(t => <option key={t.id_tipo_camiseta} value={t.id_tipo_camiseta}>{t.descripcion_tipo}</option>)}
            </select>
            <label>Género</label>
            <select name="id_genero" value={form.id_genero} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {generos.map(g => <option key={g.id_genero} value={g.id_genero}>{g.descripcion_genero}</option>)}
            </select>
            <label>Talla</label>
            <select name="id_talla" value={form.id_talla} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {tallas.map(t => <option key={t.id_talla} value={t.id_talla}>{t.descripcion_talla}</option>)}
            </select>
          </div>
          <button className="admin-productos-guardar-btn" type="submit">
            <img src="/src/assets/dashboard/icon-editar.png" alt="" /> Guardar Cambios
          </button>
        </motion.form>
      </div>
    </div>
  );
}
