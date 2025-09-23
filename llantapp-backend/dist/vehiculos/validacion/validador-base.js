"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorBase = void 0;
class ValidadorBase {
    encadenar(v) {
        this.siguiente = v;
        return v;
    }
    async validar(dto) {
        if (this.siguiente)
            await this.siguiente.validar(dto);
    }
}
exports.ValidadorBase = ValidadorBase;
//# sourceMappingURL=validador-base.js.map