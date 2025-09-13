import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "../context/UserContext";
import "../estilos/AdminProductos.css";
import SidebarAdmin from "../componentes/SidebarAdmin";

function generarSKU({ equipos, temporadas, tiposCamiseta, generos, tallas, form }) {
  const equipoObj = equipos.find(e => e.id_equipo === Number(form.id_equipo));
  const temporadaObj = temporadas.find(t => t.id_temporada === Number(form.id_temporada));
  const tipoObj = tiposCamiseta.find(t => t.id_tipo_camiseta === Number(form.id_tipo_camiseta));
  const generoObj = generos.find(g => g.id_genero === Number(form.id_genero));
  const tallaObj = tallas.find(t => t.id_talla === Number(form.id_talla));

  
  if (!equipoObj || !temporadaObj || !tipoObj || !generoObj || !tallaObj) return "";

  const normalizar = (texto, guion = false) =>
    texto
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim()
      .split(/\s+/).join(guion ? '-' : '')
      .toUpperCase();

  const nombreEquipoSKU = normalizar(equipoObj.nombre_equipo, true);

  const temporadaSKU = normalizar(temporadaObj.descripcion_temporada);
  const tipoSKU = normalizar(tipoObj.descripcion_tipo);
  const generoSKU = normalizar(generoObj.descripcion_genero);
  const tallaSKU = normalizar(tallaObj.descripcion_talla);

  return `${nombreEquipoSKU}_${temporadaSKU}_${tipoSKU}_${generoSKU}_${tallaSKU}`;
}

export default function AdminAgregarProducto() {
  const navigate = useNavigate();
  const { usuario } = useContext(UserContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        const paramsRes = await fetch("http://localhost:3000/api/parametros");
        const params = await paramsRes.json();
        setEquipos(params.equipos);
        setTallas(params.tallas);
        setGeneros(params.generos);
        setMarcas(params.marcas);
        setTiposCamiseta(params.tiposCamiseta);
        setTemporadas(params.temporadas);

        const catRes = await fetch("http://localhost:3000/api/categoria");
        const cats = await catRes.json();
        setCategorias(cats);
      } catch (error) {
        alert("Error al cargar parámetros");
      }
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (form.id_equipo && form.id_temporada && form.id_tipo_camiseta && form.id_genero && form.id_talla) {
      const nuevoSKU = generarSKU({
        equipos,
        temporadas,
        tiposCamiseta,
        generos,
        tallas,
        form
      });
      setForm(f => ({ ...f, sku: nuevoSKU }));
    } else {
      setForm(f => ({ ...f, sku: "" }));
    }
  }, [form.id_equipo, form.id_temporada, form.id_tipo_camiseta, form.id_genero, form.id_talla, equipos, temporadas, tiposCamiseta, generos, tallas]);


  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "imagen_url") {
      if (!value.startsWith("https://corsproxy.io/?") && value.length > 0) {
        value = "https://corsproxy.io/?";
      }
    }
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const prod = {
    sku: form.sku.trim(),
    descripcion_camiseta: form.descripcion_camiseta.trim(),
    imagen_url: form.imagen_url.trim(),
    id_equipo: parseInt(form.id_equipo),
    id_temporada: parseInt(form.id_temporada),
    id_categoria: parseInt(form.id_categoria),
    id_marca: parseInt(form.id_marca),
    id_tipo_camiseta: parseInt(form.id_tipo_camiseta),
    id_genero: parseInt(form.id_genero),
    id_talla: parseInt(form.id_talla),
    precio: parseFloat(form.precio),
    stock: parseInt(form.stock)
  };

  try {
    const res = await fetch("http://localhost:3000/api/producto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        id_usuario: usuario?.id_usuario,
        rol: usuario?.rol
      },
      body: JSON.stringify(prod)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || "Error al agregar producto");
    }

    alert("Producto agregado exitosamente");
    navigate("/admin/productos");
  } catch (error) {
    console.error("Error al agregar producto:", error.message);
    alert(`No se pudo agregar: ${error.message}`);
  }
};


  return (
    <div className="admin-productos-bg">
      <SidebarAdmin />

      <div className="admin-productos-overlay">
        <motion.form
          className="admin-productos-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <h1>Agregar Producto</h1>
          <p>Completa todos los campos para crear una camiseta</p>

          <div className="form-row">
            <label>SKU</label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              readOnly
              style={{
                background: form.sku ? "#8cffbcff" : "#fed2d2ff",
                cursor: "not-allowed",
              }}
              tabIndex={-1}
            />
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
            <img src="/src/assets/dashboard/icon-agregar.png" alt="" /> Guardar Producto
          </button>
        </motion.form>
      </div>
    </div>
  );
}
