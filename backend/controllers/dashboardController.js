import { PRODUCTO, USUARIO, ORDEN } from "../models/index.js";
import { Op } from "sequelize";

export async function resumenDashboard(req, res) {
  let { inicio, fin } = req.query;

  const hoy = new Date();
  const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
  const finHoy = new Date(hoy.setHours(23, 59, 59, 999));

  const fechaInicio = inicio ? new Date(inicio) : inicioHoy;
  const fechaFin = fin ? new Date(fin) : finHoy;

  const ordenes = await ORDEN.findAll({
    where: {
      fecha: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    }
  });

  const totalOrdenes = ordenes.length;
  const totalIngresos = ordenes.reduce((acc, o) => acc + parseFloat(o.total), 0);

  const nuevosUsuarios = await USUARIO.count({
    where: {
      fecha_registro: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    }
  });

  res.json({
    totalOrdenes,
    totalIngresos,
    nuevosUsuarios
  });
}

export async function obtenerKPIs(req, res) {
  try {
    // Total de productos activos
    const productos = await PRODUCTO.count({ where: { activo: true } });
    // Stock total de productos activos
    const stockRows = await PRODUCTO.findAll({
      where: { activo: true },
      attributes: ['stock']
    });
    const stock = stockRows.reduce((acc, p) => acc + (p.stock || 0), 0);
    // Usuarios activos
    const usuarios = await USUARIO.count({ where: { activo: true } });
    // Total de órdenes
    const ordenes = await ORDEN.count();

    res.json({ productos, stock, usuarios, ordenes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener KPIs" });
  }
}