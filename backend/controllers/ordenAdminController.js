import { ORDEN, DETALLE_ORDEN, USUARIO, DIRECCION, METODO_PAGO, METODO_ENVIO, ESTADO_ORDEN, PRODUCTO } from "../models/index.js";
import { Op } from "sequelize";

export async function listarOrdenes(req, res) {
  const { filtro } = req.query;

  const condicion = filtro
    ? {
        [Op.or]: [
          { '$USUARIO.nombre$': { [Op.iLike]: `%${filtro}%` } },
          { '$USUARIO.apellido$': { [Op.iLike]: `%${filtro}%` } },
          { id_orden: isNaN(filtro) ? -1 : parseInt(filtro) }
        ]
      }
    : {};

  try {
    const ordenes = await ORDEN.findAll({
      where: condicion,
      include: [
        {
          model: USUARIO,
          required: true
        },
        DIRECCION,
        METODO_PAGO,
        METODO_ENVIO,
        ESTADO_ORDEN
      ]
    });

    res.json(ordenes);
  } catch (error) {
    console.error("Error en listarOrdenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}


export async function detalleOrdenAdmin(req, res) {
  const { id } = req.params;
  const orden = await ORDEN.findByPk(id, {
    include: [USUARIO, DIRECCION, METODO_PAGO, METODO_ENVIO, ESTADO_ORDEN, {
      model: DETALLE_ORDEN,
      include: [PRODUCTO]
    }]
  });
  res.json(orden);
}

export async function cancelarOrdenAdmin(req, res) {
  const { id } = req.params;
  await ORDEN.update({ id_estado_orden: 5 }, { where: { id_orden: id } });
  res.json({ mensaje: "Orden cancelada por administrador" });
}
