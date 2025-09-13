import { USUARIO } from "../models/index.js";

export async function obtenerDatosUsuario(req, res) {
  const { id } = req.params;
  const usuario = await USUARIO.findByPk(id);
  res.json(usuario);
}

export async function actualizarDatosUsuario(req, res) {
  const { id } = req.params;
  await USUARIO.update(req.body, { where: { id_usuario: id } });
  const actualizado = await USUARIO.findByPk(id);
  res.json(actualizado);
}

export async function cambiarPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  await USUARIO.update({ password }, { where: { id_usuario: id } });
  res.json({ mensaje: "Contraseña actualizada correctamente" });
}
