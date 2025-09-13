import { CATEGORIA, CAMISETA, PRODUCTO } from "../models/index.js";

export async function listarCategorias(req, res) {
  const categorias = await CATEGORIA.findAll();
  res.json(categorias);
}

export async function agregarCategoria(req, res) {
  try {
    const { nombre_categoria, imagen_url } = req.body;

    if (!nombre_categoria || nombre_categoria.trim() === "") {
      return res.status(400).json({ mensaje: "El nombre de la categoría es obligatorio" });
    }

    const existente = await CATEGORIA.findOne({ where: { nombre_categoria } });
    if (existente) {
      return res.status(409).json({ mensaje: "Ya existe una categoría con ese nombre" });
    }

    const nueva = await CATEGORIA.create({ nombre_categoria, imagen_url });
    res.status(201).json(nueva);
  } catch (error) {
    console.error("Error al agregar categoría:", error);
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ mensaje: "El nombre ya está registrado (único)" });
    }
    res.status(500).json({ mensaje: "Error interno al agregar categoría" });
  }
}

export async function detalleCategoria(req, res) {
  const { id } = req.params;
  const categoria = await CATEGORIA.findByPk(id, {
    include: {
      model: CAMISETA,
      include: [PRODUCTO]
    }
  });
  res.json(categoria);
}


export async function productosPorCategoria(req, res) {
  const { id } = req.params;

  const productos = await PRODUCTO.findAll({
    include: {
      model: CAMISETA,
      where: { id_categoria: id }
    }
  });

  res.json(productos);
}


export async function actualizarCategoria(req, res) {
  try {
    const { id } = req.params;
    const { nombre_categoria, imagen_url } = req.body;

    if (!nombre_categoria || nombre_categoria.trim() === "") {
      return res.status(400).json({ mensaje: "El nombre de la categoría es obligatorio" });
    }

    const categoria = await CATEGORIA.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    const duplicada = await CATEGORIA.findOne({
      where: {
        nombre_categoria,
        id_categoria: { [Op.ne]: id }
      }
    });
    if (duplicada) {
      return res.status(409).json({ mensaje: "Ya existe otra categoría con ese nombre" });
    }

    await categoria.update({ nombre_categoria, imagen_url });
    res.json({ mensaje: "Categoría actualizada correctamente", categoria });

  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ mensaje: "Error interno al actualizar la categoría" });
  }
}


