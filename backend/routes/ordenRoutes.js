import express from "express";
import {
  listarOrdenesPorUsuario,
  detalleOrdenUsuario,
  cancelarOrden,
  crearOrden
} from "../controllers/ordenController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";

const router = express.Router();

router.get("/usuario/:id_usuario", validarAutenticacion, listarOrdenesPorUsuario);
router.get("/detalle/:id_orden", validarAutenticacion, detalleOrdenUsuario);
router.put("/cancelar/:id_orden", validarAutenticacion, cancelarOrden);
router.post("/", validarAutenticacion, crearOrden);

export default router;

