import { USUARIO, ROL } from "../models/index.js";

export async function login(req, res) {
  const { correo, password } = req.body;

  const usuario = await USUARIO.findOne({
    where: { correo, password },
    include: ROL
  });

  if (!usuario || !usuario.activo) {
    return res.status(401).json({ mensaje: "Credenciales inválidas o usuario inactivo" });
  }

  res.json({
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    correo: usuario.correo,
    rol: usuario.ROL?.nombre_rol?.toLowerCase() || 'usuario'
  });
}


export async function registrar(req, res) {
  try {
    const { nombre, apellido, correo, password } = req.body;

    const existente = await USUARIO.findOne({ where: { correo } });
    if (existente) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const nuevo = await USUARIO.create({
      nombre,
      apellido,
      correo,
      password,
      id_rol: 1  
    });

    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error });
  }
}

export async function recuperarPassword(req, res) {
  const { correo } = req.body;
  const usuario = await USUARIO.findOne({ where: { correo } });
  if (!usuario) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }
  res.json({ mensaje: "Correo enviado con instrucciones para recuperar la contraseña" });
}
