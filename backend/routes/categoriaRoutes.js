import express from "express";
import { listarCategorias, agregarCategoria, detalleCategoria, productosPorCategoria, actualizarCategoria } from "../controllers/categoriaController.js";
import { validarAutenticacion } from "../middlewares/validarAutenticacion.js";
import { validarRolAdmin } from "../middlewares/validarRolAdmin.js";

const router = express.Router();

router.get("/", listarCategorias);
router.post("/", validarAutenticacion, validarRolAdmin, agregarCategoria);
router.get("/:id", validarAutenticacion, detalleCategoria);
router.get("/:id/productos", productosPorCategoria); 
router.put("/:id", validarAutenticacion, validarRolAdmin, actualizarCategoria);

export default router;
