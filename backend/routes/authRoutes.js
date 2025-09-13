import express from "express";
import { login, registrar, recuperarPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/registro", registrar);
router.post("/recuperar-password", recuperarPassword);

export default router;
