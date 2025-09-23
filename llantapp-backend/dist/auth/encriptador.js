"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encriptador = void 0;
const bcrypt = require("bcrypt");
class Encriptador {
    async hashear(plain) {
        const rondas = 12;
        return bcrypt.hash(plain, rondas);
    }
    async comparar(plain, hash) {
        return bcrypt.compare(plain, hash);
    }
}
exports.Encriptador = Encriptador;
//# sourceMappingURL=encriptador.js.map