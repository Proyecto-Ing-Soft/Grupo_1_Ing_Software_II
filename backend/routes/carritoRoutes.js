import express from "express";
import {
  verCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito
} from "../controllers/carritoController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";

const router = express.Router();

router.get("/", validarAutenticacion, verCarrito);
router.post("/", validarAutenticacion, agregarAlCarrito);
router.put("/producto/:id_producto", validarAutenticacion, actualizarCantidad);
router.delete("/producto/:id_producto", validarAutenticacion, eliminarDelCarrito);

export default router;

