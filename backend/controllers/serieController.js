import { SERIE, PRODUCTO, SERIE_PRODUCTO } from "../models/index.js";

export async function listarSeries(req, res) {
  const series = await SERIE.findAll({ include: PRODUCTO });
  res.json(series);
}

export async function crearSerie(req, res) {
  const { nombre_serie, descripcion, imagen_url } = req.body;
  const nueva = await SERIE.create({ nombre_serie, descripcion, imagen_url });
  res.status(201).json(nueva);
}

export async function detalleSerie(req, res) {
  const { id } = req.params;
  const serie = await SERIE.findByPk(id, {
    include: PRODUCTO
  });
  res.json(serie);
}

export async function agregarProductosASerie(req, res) {
  const { id } = req.params;
  const { productos } = req.body;
  const data = productos.map(id_producto => ({
    id_serie: parseInt(id),
    id_producto
  }));
  await SERIE_PRODUCTO.bulkCreate(data);
  res.json({ mensaje: "Productos agregados a la serie" });
}
