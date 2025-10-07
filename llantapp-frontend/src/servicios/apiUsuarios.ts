// src/servicios/apiUsuarios.ts
import { getJSON } from './_http';
import type { Perfil } from './apiAuth';

export const apiUsuarios = {
  listarPorRol: (rol: 'ADMIN'|'MECANICO'|'ASISTENTE'|'CHOFER'|'EMPRESA', token?: string) =>
    getJSON<Perfil[]>(`/usuarios?rol=${rol}`, token),
};
