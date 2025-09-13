import express from "express";
import {
  listarOrdenes,
  detalleOrdenAdmin,
  cancelarOrdenAdmin
} from "../controllers/ordenAdminController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", validarAutenticacion, validarRolAdmin, listarOrdenes);
router.get("/:id", validarAutenticacion, validarRolAdmin, detalleOrdenAdmin);
router.put("/cancelar/:id", validarAutenticacion, validarRolAdmin, cancelarOrdenAdmin);

export default router;
