import express from "express";
import { resumenDashboard, obtenerKPIs } from "../controllers/dashboardController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", validarAutenticacion, validarRolAdmin, resumenDashboard);
router.get("/kpis", obtenerKPIs);

export default router;
