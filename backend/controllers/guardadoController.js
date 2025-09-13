import { CARRITO, CARRITO_ITEM, PRODUCTO, CAMISETA } from "../models/index.js";

export async function verGuardados(req, res) {
  const id_usuario = req.usuario.id_usuario;

  const carrito = await CARRITO.findOne({ where: { id_usuario } });
  if (!carrito) {
    return res.status(404).json({ mensaje: "Carrito no encontrado para el usuario" });
  }

  const guardados = await CARRITO_ITEM.findAll({
    where: { id_carrito: carrito.id_carrito, guardado: true },
    include: [
        {
          model: PRODUCTO,
          include: [CAMISETA] 
        }
      ]
  });

  res.json(guardados);
}

export async function moverAGuardado(req, res) {
  const id_usuario = req.usuario.id_usuario;
  const { id_producto } = req.params;

  const carrito = await CARRITO.findOne({ where: { id_usuario } });
  if (!carrito) return res.status(404).json({ mensaje: "Carrito no encontrado" });

  const itemCarrito = await CARRITO_ITEM.findOne({
    where: { id_carrito: carrito.id_carrito, id_producto, guardado: false }
  });

  if (!itemCarrito) {
    return res.status(404).json({ mensaje: "Producto no está en el carrito" });
  }

  const itemGuardado = await CARRITO_ITEM.findOne({
    where: { id_carrito: carrito.id_carrito, id_producto, guardado: true }
  });

  if (itemGuardado) {
    await itemGuardado.update({ cantidad: itemGuardado.cantidad + itemCarrito.cantidad });
  } else {
    await CARRITO_ITEM.create({
      id_carrito: carrito.id_carrito,
      id_producto,
      cantidad: itemCarrito.cantidad,
      guardado: true
    });
  }

  await itemCarrito.destroy();
  res.json({ mensaje: "Producto movido a guardados" });
}

export async function moverAlCarrito(req, res) {
  const id_usuario = req.usuario.id_usuario;
  const { id_producto } = req.params;

  const carrito = await CARRITO.findOne({ where: { id_usuario } });
  if (!carrito) return res.status(404).json({ mensaje: "Carrito no encontrado" });

  const itemGuardado = await CARRITO_ITEM.findOne({
    where: { id_carrito: carrito.id_carrito, id_producto, guardado: true }
  });

  if (!itemGuardado) {
    return res.status(404).json({ mensaje: "Producto no está en guardados" });
  }

  const itemCarrito = await CARRITO_ITEM.findOne({
    where: { id_carrito: carrito.id_carrito, id_producto, guardado: false }
  });

  if (itemCarrito) {
    await itemCarrito.update({ cantidad: itemCarrito.cantidad + itemGuardado.cantidad });
  } else {
    await CARRITO_ITEM.create({
      id_carrito: carrito.id_carrito,
      id_producto,
      cantidad: itemGuardado.cantidad,
      guardado: false
    });
  }

  await itemGuardado.destroy();
  res.json({ mensaje: "Producto movido al carrito" });
}

export async function eliminarGuardado(req, res) {
  const id_usuario = req.usuario.id_usuario;
  const { id_producto } = req.params;

  const carrito = await CARRITO.findOne({ where: { id_usuario } });
  if (!carrito) return res.status(404).json({ mensaje: "Carrito no encontrado" });

  const item = await CARRITO_ITEM.findOne({
    where: { id_carrito: carrito.id_carrito, id_producto, guardado: true }
  });

  if (!item) {
    return res.status(404).json({ mensaje: "Producto no encontrado en guardados" });
  }

  await item.destroy();
  res.json({ mensaje: "Producto eliminado de guardados" });
}
