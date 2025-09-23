"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorFormatoPlaca = void 0;
const validador_base_1 = require("./validador-base");
const common_1 = require("@nestjs/common");
class ValidadorFormatoPlaca extends validador_base_1.ValidadorBase {
    async validar(dto) {
        const ok = /^[A-Z0-9-]{5,10}$/.test(dto.placa);
        if (!ok)
            throw new common_1.BadRequestException('Formato de placa inválido');
        await super.validar(dto);
    }
}
exports.ValidadorFormatoPlaca = ValidadorFormatoPlaca;
//# sourceMappingURL=validador-formato-placa.js.map