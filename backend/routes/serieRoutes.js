import express from "express";
import {
  listarSeries,
  crearSerie,
  detalleSerie,
  agregarProductosASerie
} from "../controllers/serieController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", listarSeries);
router.get("/:id", detalleSerie);
router.post("/", validarAutenticacion, validarRolAdmin, crearSerie);
router.post("/:id/productos", validarAutenticacion, validarRolAdmin, agregarProductosASerie);

export default router;
