import * as bcrypt from 'bcrypt';

// SRP: encapsula hashing y comparación.
// OCP: si cambiamos de algoritmo, solo se toca aquí.
export class Encriptador {
  async hashear(plain: string) {
    const rondas = 12;
    return bcrypt.hash(plain, rondas);
  }

  async comparar(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
