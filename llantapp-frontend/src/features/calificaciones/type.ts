export interface Calificacion {
  id: number;
  citaId: number;
  clienteId: number;
  estrellas: number;
  comentario?: string | null;
  creadaEn: string;
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  citaId?: number | null;
}
