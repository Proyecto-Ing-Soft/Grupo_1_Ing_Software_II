import { ORDEN, DETALLE_ORDEN, DIRECCION, METODO_PAGO, METODO_ENVIO, ESTADO_ORDEN, PRODUCTO, CARRITO, CARRITO_ITEM } from "../models/index.js";
import { sequelize } from "../config/database.js";
import { CAMISETA } from "../models/index.js";


export async function listarOrdenesPorUsuario(req, res) {
  const { id_usuario } = req.params;

  const ordenes = await ORDEN.findAll({
    where: { id_usuario },
    include: [DIRECCION, METODO_PAGO, METODO_ENVIO, ESTADO_ORDEN]
  });

  res.json(ordenes);
}

export async function detalleOrdenUsuario(req, res) {
  const { id_orden } = req.params;
  const id_usuario = req.headers.id_usuario;

  const orden = await ORDEN.findOne({
    where: {
      id_orden,
      id_usuario
    },
    include: [
      DIRECCION,
      METODO_PAGO,
      METODO_ENVIO,
      ESTADO_ORDEN,
      {
        model: DETALLE_ORDEN,
        include: [
          {
            model: PRODUCTO,
            include: [CAMISETA] 
          }
        ]
      }
    ]
  });

  if (!orden) {
    return res.status(404).json({ mensaje: "Orden no encontrada o no pertenece al usuario" });
  }

  res.json(orden);
}


export async function cancelarOrden(req, res) {
  const { id_orden } = req.params;

  const orden = await ORDEN.findByPk(id_orden);
  if (!orden) {
    return res.status(404).json({ mensaje: "Orden no encontrada" });
  }

  await orden.update({ id_estado_orden: 5 }); 
  res.json({ mensaje: "Orden cancelada" });
}

export async function crearOrden(req, res) {
  const id_usuario = parseInt(req.headers.id_usuario);
  const { direccion, id_metodo_pago, id_metodo_envio, items } = req.body;

  if (!id_usuario || !direccion || !id_metodo_pago || !id_metodo_envio || !items || items.length === 0) {
    return res.status(400).json({ mensaje: "Faltan datos para crear la orden" });
  }

  try {
    const resultado = await sequelize.transaction(async (t) => {

      const nuevaDireccion = await DIRECCION.create({
        ...direccion,
        id_usuario
      }, { transaction: t });

      const total = await Promise.all(items.map(async (item) => {
        const producto = await PRODUCTO.findByPk(item.id_producto);
        if (!producto || producto.stock < item.cantidad) {
          throw new Error(`Producto ${item.id_producto} no disponible o sin stock suficiente`);
        }
        return producto.precio * item.cantidad;
      }));
      const sumaTotal = total.reduce((acc, val) => acc + val, 0);

      const nuevaOrden = await ORDEN.create({
        id_usuario,
        id_direccion: nuevaDireccion.id_direccion,
        id_metodo_pago,
        id_metodo_envio,
        id_estado_orden: 1,
        total: sumaTotal
      }, { transaction: t });

      for (const item of items) {
        const producto = await PRODUCTO.findByPk(item.id_producto);
        await DETALLE_ORDEN.create({
          id_orden: nuevaOrden.id_orden,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          subtotal: producto.precio * item.cantidad
        }, { transaction: t });

        await producto.update({ stock: producto.stock - item.cantidad }, { transaction: t });
      }

      const carrito = await CARRITO.findOne({ where: { id_usuario } });
      if (carrito) {
        await CARRITO_ITEM.destroy({ where: { id_carrito: carrito.id_carrito, guardado: false  }, transaction: t });
      }

      return nuevaOrden;
    });

    res.status(201).json({ mensaje: "Orden creada exitosamente", orden: resultado });

  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ mensaje: "Error al crear la orden", error: error.message });
  }
}
