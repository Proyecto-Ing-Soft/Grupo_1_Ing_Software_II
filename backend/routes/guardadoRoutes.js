import express from "express";
import {
  verGuardados,
  moverAGuardado,
  moverAlCarrito,
  eliminarGuardado
} from "../controllers/guardadoController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";

const router = express.Router();

router.get("/", validarAutenticacion, verGuardados);
router.put("/mover-guardado/:id_producto", validarAutenticacion, moverAGuardado);
router.put("/mover-carrito/:id_producto", validarAutenticacion, moverAlCarrito);
router.delete("/:id_producto", validarAutenticacion, eliminarGuardado);

export default router;
