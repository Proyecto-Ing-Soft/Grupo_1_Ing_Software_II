// encriptador.ts
import * as bcrypt from 'bcrypt';

// SRP: encapsula hashing/comparación.
// OCP: si cambiamos a Argon2, solo tocamos aquí.
export class Encriptador {
  async hashear(plain: string) {
    const rondas = 12; // Seguridad razonable.
    return bcrypt.hash(plain, rondas);
  }
  async comparar(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
