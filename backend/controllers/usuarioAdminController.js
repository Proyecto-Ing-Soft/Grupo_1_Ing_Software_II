import { USUARIO, ORDEN } from "../models/index.js";
import { Op } from "sequelize";

export async function listarUsuarios(req, res) {
  const { filtro } = req.query;
  const condicion = filtro
    ? {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${filtro}%` } },
          { apellido: { [Op.iLike]: `%${filtro}%` } }
        ]
      }
    : {};
  const usuarios = await USUARIO.findAll({ where: condicion });
  res.json(usuarios);
}

export async function detalleUsuario(req, res) {
  const { id } = req.params;
  const usuario = await USUARIO.findByPk(id);
  const ordenes = await ORDEN.findAll({
    where: { id_usuario: id },
    limit: 10
  });
  res.json({ usuario, ordenes });
}

export async function desactivarUsuario(req, res) {
  const { id } = req.params;
  const usuario = await USUARIO.findByPk(id);
  await usuario.update({ activo: !usuario.activo });
  res.json({ mensaje: `Usuario ${usuario.activo ? 'activado' : 'desactivado'}` });
}
