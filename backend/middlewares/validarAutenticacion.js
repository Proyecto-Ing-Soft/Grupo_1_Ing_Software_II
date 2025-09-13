import { USUARIO, ROL } from "../models/index.js";

export async function validarAutenticacion(req, res, next) {
  const id_usuario = req.headers.id_usuario;

  if (!id_usuario) {
    return res.status(401).json({ mensaje: "Usuario no autenticado" });
  }

  const usuario = await USUARIO.findByPk(id_usuario, {
    include: ROL
  });

  if (!usuario) {
    return res.status(401).json({ mensaje: "Usuario no encontrado" });
  }

  req.usuario = {
    id_usuario: usuario.id_usuario,
    rol: usuario.ROL?.nombre_rol?.toLowerCase() || null
  };

  next();
}
