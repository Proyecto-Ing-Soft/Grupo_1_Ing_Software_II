import express from "express";
import {
  obtenerDatosUsuario,
  actualizarDatosUsuario,
  cambiarPassword,
} from "../controllers/usuarioController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";

const router = express.Router();

router.get("/:id", validarAutenticacion, obtenerDatosUsuario);
router.put("/:id", validarAutenticacion, actualizarDatosUsuario);
router.put("/:id/password", validarAutenticacion, cambiarPassword);

export default router;
