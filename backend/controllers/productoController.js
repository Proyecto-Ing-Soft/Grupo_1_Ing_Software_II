import { sequelize } from "../config/database.js";
import { PRODUCTO, CAMISETA, GENERO, TALLA, CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA, SERIE } from "../models/index.js";
import { ValidationError, UniqueConstraintError, Op } from "sequelize";

export async function listarProductos(req, res) {
  try {
    const { nombre, serie, marca, categoria, activo } = req.query;

    const filtros = {};
    if (activo !== undefined) {
      filtros.activo = activo === 'true';
    }

    const productos = await PRODUCTO.findAll({
      where: filtros,
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA,
        {
          model: SERIE,
          through: { attributes: [] }
        }
      ]
    });

    const filtrado = productos.filter((p) => {
      const camiseta = p.CAMISETum;
      const nombreOk = !nombre || camiseta?.descripcion_camiseta?.toLowerCase().includes(nombre.toLowerCase());
      const serieOk = !serie || p.SERIEs?.some(s => s.nombre_serie?.toLowerCase().includes(serie.toLowerCase()));
      const marcaOk = !marca || camiseta?.MARCA?.nombre_marca?.toLowerCase().includes(marca.toLowerCase());
      const catOk = !categoria || camiseta?.CATEGORIum?.nombre_categoria?.toLowerCase().includes(categoria.toLowerCase());
      return nombreOk && serieOk && marcaOk && catOk;
    });

    res.json(filtrado);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function getProductosActivos(req, res) {
  try {
    const productos = await PRODUCTO.findAll({
      where: { activo: true },
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ]
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos activos:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function detalleProducto(req, res) {
  try {
    const { id } = req.params;
    const producto = await PRODUCTO.findByPk(id, {
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA,
        {
          model: SERIE,
          through: { attributes: [] }
        }
      ]
    });
    
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }
    
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function agregarProducto(req, res) {
  try {
    const {
      sku,
      descripcion_camiseta,
      precio,
      stock,
      imagen_url,
      id_equipo,
      id_temporada,
      id_categoria,
      id_marca,
      id_tipo_camiseta,
      id_genero,
      id_talla
    } = req.body;

    if (!descripcion_camiseta || !sku || !precio || !stock || !imagen_url ||
        !id_equipo || !id_temporada || !id_categoria || !id_marca || !id_tipo_camiseta ||
        !id_genero || !id_talla) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    const duplicado = await PRODUCTO.findOne({ where: { sku } });
    if (duplicado) {
      return res.status(409).json({ mensaje: `El SKU "${sku}" ya está registrado.` });
    }

    let camisetaExistente = await CAMISETA.findOne({
      where: {
        descripcion_camiseta,
        imagen_url,
        id_equipo,
        id_temporada,
        id_categoria,
        id_marca,
        id_tipo_camiseta
      }
    });

    if (!camisetaExistente) {
      camisetaExistente = await CAMISETA.create({
        descripcion_camiseta,
        imagen_url,
        id_equipo,
        id_temporada,
        id_categoria,
        id_marca,
        id_tipo_camiseta
      });
    }

    const nuevoProducto = await PRODUCTO.create({
      sku,
      precio,
      stock,
      id_genero,
      id_talla,
      id_camiseta: camisetaExistente.id_camiseta
    });

    res.status(201).json(nuevoProducto);

  } catch (error) {
    console.error("Error al agregar producto:", error);

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ mensaje: "Violación de restricción única (SKU duplicado)" });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ mensaje: "Error de validación", detalles: error.errors });
    }

    res.status(500).json({ mensaje: "Error interno del servidor", error: error.message });
  }
}

export async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    
    const [rowsUpdated] = await PRODUCTO.update(req.body, { 
      where: { id_producto: id } 
    });
    
    if (rowsUpdated === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }
    
    const actualizado = await PRODUCTO.findByPk(id, {
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ]
    });
    
    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function cambiarEstadoProducto(req, res) {
  try {
    const { id } = req.params;
    
    const producto = await PRODUCTO.findByPk(id);
    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }
    
    await producto.update({ activo: !producto.activo });
    res.json({ mensaje: `Producto ${producto.activo ? 'activado' : 'desactivado'}` });
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function listarProductosDestacados(req, res) {
  try {
    const { agrupado = 'true' } = req.query;
    
    // Usar ORDER BY RANDOM() para obtener productos aleatorios
    const productos = await PRODUCTO.findAll({
      where: { activo: true },
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ],
      order: sequelize.random(), // Orden aleatorio
      limit: agrupado === 'true' ? 50 : 10 // Obtener más productos si vamos a agrupar para tener variedad
    });

    let resultado;
    if (agrupado === 'true') {
      const productosAgrupados = agruparProductosPorCamiseta(productos);
      resultado = productosAgrupados.slice(0, 10); // Limitar a 10 después de agrupar
    } else {
      resultado = productos.slice(0, 10);
    }

    res.json(resultado);
  } catch (error) {
    console.error("Error en listarProductosDestacados:", error.message);
    res.status(500).json({ mensaje: "Error al obtener productos destacados" });
  }
}

export async function listarProductosRecientes(req, res) {
  try {
    const { agrupado = 'true' } = req.query;
    
    if (agrupado === 'true') {
      // Para obtener 10 camisetas únicas, necesitamos obtener más productos
      // porque el agrupamiento reduce significativamente el número
      const productos = await PRODUCTO.findAll({
        where: { activo: true },
        include: [
          {
            model: CAMISETA,
            include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
          },
          GENERO,
          TALLA
        ],
        order: [["id_producto", "DESC"]],
        limit: 200 // Aumentar para tener más variedad de camisetas
      });

      console.log(`Productos encontrados para novedades: ${productos.length}`);
      
      const productosAgrupados = agruparProductosPorCamiseta(productos);
      console.log(`Productos agrupados: ${productosAgrupados.length}`);
      
      // Tomar los primeros 10 grupos (que representan las camisetas más recientes)
      const resultado = productosAgrupados.slice(0, 10);
      console.log(`Resultado final: ${resultado.length} productos`);
      
      res.json(resultado);
    } else {
      // Sin agrupar, solo tomar los 10 productos más recientes
      const productos = await PRODUCTO.findAll({
        where: { activo: true },
        include: [
          {
            model: CAMISETA,
            include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
          },
          GENERO,
          TALLA
        ],
        order: [["id_producto", "DESC"]],
        limit: 10
      });
      
      res.json(productos);
    }
  } catch (error) {
    console.error("Error en listarProductosRecientes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener productos recientes" });
  }
}

// Función helper para agrupar productos por camiseta
function agruparProductosPorCamiseta(productos) {
  const grupos = new Map();

  console.log(`Iniciando agrupamiento con ${productos.length} productos`);

  productos.forEach(producto => {
    const camiseta = producto.CAMISETum;
    if (!camiseta) {
      console.log(`Producto ${producto.id_producto} sin camiseta asociada`);
      return;
    }

    // Crear clave única para agrupar
    const clave = `${camiseta.id_camiseta}-${camiseta.descripcion_camiseta}`;
    
    if (!grupos.has(clave)) {
      // Crear nuevo grupo - tomar el primer producto (que ya viene ordenado por ID DESC)
      grupos.set(clave, {
        id_camiseta: camiseta.id_camiseta,
        id_producto: producto.id_producto,
        descripcion_camiseta: camiseta.descripcion_camiseta,
        imagen_url: camiseta.imagen_url,
        precio: parseFloat(producto.precio).toFixed(2),
        CAMISETum: camiseta,
        stock: producto.stock,
        esGrupo: true
      });
      console.log(`Nuevo grupo creado: ${camiseta.descripcion_camiseta} (ID: ${producto.id_producto})`);
    } else {
      // Si ya existe el grupo, mantener el producto con ID más alto (más reciente)
      // pero usar el precio más bajo si es mejor
      const grupo = grupos.get(clave);
      const precioActual = parseFloat(producto.precio);
      const precioGrupo = parseFloat(grupo.precio);
      
      // Solo actualizar el precio si es menor, pero mantener el ID del producto más reciente
      if (precioActual < precioGrupo) {
        grupo.precio = precioActual.toFixed(2);
        console.log(`Actualizado precio de ${camiseta.descripcion_camiseta}: ${precioActual} (manteniendo ID más alto: ${grupo.id_producto})`);
      }
    }
  });

  const resultado = Array.from(grupos.values());
  console.log(`Agrupamiento completado: ${resultado.length} grupos únicos`);
  
  // Ordenar por el ID del producto más alto en cada grupo para mantener el orden de "novedades"
  resultado.sort((a, b) => b.id_producto - a.id_producto);
  
  return resultado;
}

// Función helper para validar URL de imagen
function esUrlImagenValida(url) {
  if (!url) return false;
  try {
    new URL(url);
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
  } catch {
    return false;
  }
}

export async function buscarProductos(req, res) {
  try {
    const { q, orden = 'nombre', agrupado = 'true' } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const termino = q.toLowerCase();
    
    
    const productos = await PRODUCTO.findAll({
      where: { activo: true },
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ]
    });

    
    const productosFiltrados = productos.filter(p => {
      const camiseta = p.CAMISETum;
      const descripcion = camiseta?.descripcion_camiseta?.toLowerCase() || '';
      const marca = camiseta?.MARCA?.nombre_marca?.toLowerCase() || '';
      
      return descripcion.includes(termino) || marca.includes(termino);
    });

    // Limpiar URLs de imagen inválidas
    const productosLimpios = productosFiltrados.map(p => {
      const producto = p.toJSON();
      if (producto.CAMISETum && !esUrlImagenValida(producto.CAMISETum.imagen_url)) {
        producto.CAMISETum.imagen_url = '/placeholder-image.jpg';
      }
      return producto;
    });

    // Agrupar o no según el parámetro
    let resultado;
    if (agrupado === 'true') {
      const productosAgrupados = agruparProductosPorCamiseta(productosLimpios);
      
      // Ordenar grupos
      resultado = productosAgrupados.sort((a, b) => {
        if (orden === 'precio') {
          return parseFloat(a.precio) - parseFloat(b.precio);
        }
        return a.descripcion_camiseta.localeCompare(b.descripcion_camiseta);
      });
    } else {
      // Ordenar productos individuales
      resultado = productosLimpios.sort((a, b) => {
        if (orden === 'precio') {
          return parseFloat(a.precio) - parseFloat(b.precio);
        }
        return (a.CAMISETum?.descripcion_camiseta || '').localeCompare(b.CAMISETum?.descripcion_camiseta || '');
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    res.status(500).json({ mensaje: "Error en la búsqueda", error: error.message });
  }
}

export async function obtenerTallasCamiseta(req, res) {
  try {
    const { idCamiseta } = req.params;
    
    const productos = await PRODUCTO.findAll({
      where: { 
        id_camiseta: idCamiseta,
        activo: true 
      },
      include: [
        {
          model: CAMISETA,
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ]
    });

    const tallasDisponibles = productos.map(p => ({
      id_producto: p.id_producto,
      talla: p.TALLum?.nombre_talla || 'Sin talla',
      precio: p.precio,
      stock: p.stock,
      sku: p.sku,
      genero: p.GENERo?.nombre_genero || 'Unisex'
    }));

    res.json({
      id_camiseta: idCamiseta,
      camiseta: productos.length > 0 ? productos[0].CAMISETum : null,
      tallas_disponibles: tallasDisponibles
    });
  } catch (error) {
    console.error("Error al obtener tallas:", error);
    res.status(500).json({ mensaje: "Error al obtener tallas de la camiseta" });
  }
}

export async function obtenerProductosPorCategoria(req, res) {
  try {
    const { id } = req.params;
    const { agrupado = 'true', orden = 'nombre' } = req.query;
    
    const productos = await PRODUCTO.findAll({
      where: { activo: true },
      include: [
        {
          model: CAMISETA,
          where: { id_categoria: id },
          include: [CATEGORIA, MARCA, TIPO_CAMISETA, EQUIPO, TEMPORADA]
        },
        GENERO,
        TALLA
      ]
    });

    // Limpiar URLs de imagen inválidas
    const productosLimpios = productos.map(p => {
      const producto = p.toJSON();
      if (producto.CAMISETum && !esUrlImagenValida(producto.CAMISETum.imagen_url)) {
        producto.CAMISETum.imagen_url = '/placeholder-image.jpg';
      }
      return producto;
    });

    // Agrupar o no según el parámetro
    let resultado;
    if (agrupado === 'true') {
      const productosAgrupados = agruparProductosPorCamiseta(productosLimpios);
      
      // Ordenar grupos
      resultado = productosAgrupados.sort((a, b) => {
        if (orden === 'precio_asc') {
          return parseFloat(a.precio) - parseFloat(b.precio);
        }
        if (orden === 'precio_desc') {
          return parseFloat(b.precio) - parseFloat(a.precio);
        }
        if (orden === 'nombre_desc') {
          return b.descripcion_camiseta.localeCompare(a.descripcion_camiseta);
        }
        // Por defecto: nombre ascendente
        return a.descripcion_camiseta.localeCompare(b.descripcion_camiseta);
      });
    } else {
      // Ordenar productos individuales
      resultado = productosLimpios.sort((a, b) => {
        if (orden === 'precio_asc') {
          return parseFloat(a.precio) - parseFloat(b.precio);
        }
        if (orden === 'precio_desc') {
          return parseFloat(b.precio) - parseFloat(a.precio);
        }
        if (orden === 'nombre_desc') {
          return (b.CAMISETum?.descripcion_camiseta || '').localeCompare(a.CAMISETum?.descripcion_camiseta || '');
        }
        // Por defecto: nombre ascendente
        return (a.CAMISETum?.descripcion_camiseta || '').localeCompare(b.CAMISETum?.descripcion_camiseta || '');
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({ mensaje: "Error al obtener productos por categoría", error: error.message });
  }
}
