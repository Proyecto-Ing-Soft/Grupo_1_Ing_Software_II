import express from "express";
import {
  listarUsuarios,
  detalleUsuario,
  desactivarUsuario
} from "../controllers/usuarioAdminController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", validarAutenticacion, validarRolAdmin, listarUsuarios);
router.get("/:id", validarAutenticacion, validarRolAdmin, detalleUsuario);
router.put("/:id/estado", validarAutenticacion, validarRolAdmin, desactivarUsuario);

export default router;
