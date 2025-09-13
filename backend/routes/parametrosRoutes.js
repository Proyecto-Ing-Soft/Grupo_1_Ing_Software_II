import express from "express";
import { obtenerParametros } from "../controllers/parametrosController.js";

const router = express.Router();

router.get("/", obtenerParametros);

export default router;
