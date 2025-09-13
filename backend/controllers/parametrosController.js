import {
  EQUIPO,
  TALLA,
  GENERO,
  MARCA,
  TIPO_CAMISETA,
  TEMPORADA
} from "../models/index.js";

export async function obtenerParametros(req, res) {
  try {
    const [ equipos, tallas, generos, marcas, tiposCamiseta, temporadas] = await Promise.all([
      EQUIPO.findAll(),
      TALLA.findAll(),
      GENERO.findAll(),
      MARCA.findAll(),
      TIPO_CAMISETA.findAll(),
      TEMPORADA.findAll()
    ]);

    res.json({
      equipos,
      tallas,
      generos,
      marcas,
      tiposCamiseta,
      temporadas
    });
  } catch (error) {
    console.error("Error al obtener parámetros:", error);
    res.status(500).json({ mensaje: "Error al obtener parámetros" });
  }
}
