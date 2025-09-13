import express from "express";
import {
  listarProductos,
  getProductosActivos,
  detalleProducto,
  agregarProducto,
  actualizarProducto,
  cambiarEstadoProducto,
  listarProductosDestacados,
  listarProductosRecientes,
  buscarProductos,
  obtenerTallasCamiseta,
  obtenerProductosPorCategoria
} from "../controllers/productoController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", listarProductos);
router.get("/buscar", buscarProductos);
router.get("/destacado", listarProductosDestacados);
router.get("/reciente", listarProductosRecientes);
router.get("/activos", getProductosActivos);
router.get("/categoria/:id", obtenerProductosPorCategoria);
router.get("/camiseta/:idCamiseta/tallas", obtenerTallasCamiseta);
router.get("/:id", detalleProducto);
router.post("/", validarAutenticacion, validarRolAdmin, agregarProducto);
router.put("/:id", validarAutenticacion, validarRolAdmin, actualizarProducto);
router.put("/:id/estado", validarAutenticacion, validarRolAdmin, cambiarEstadoProducto);



export default router;
