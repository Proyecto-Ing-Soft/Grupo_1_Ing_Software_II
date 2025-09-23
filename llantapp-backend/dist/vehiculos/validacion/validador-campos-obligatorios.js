"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorCamposObligatorios = void 0;
const validador_base_1 = require("./validador-base");
const common_1 = require("@nestjs/common");
class ValidadorCamposObligatorios extends validador_base_1.ValidadorBase {
    async validar(dto) {
        const obligatorios = ['placa', 'marca', 'modelo', 'anio', 'color'];
        for (const k of obligatorios) {
            if (!dto[k])
                throw new common_1.BadRequestException(`El campo ${k} es obligatorio`);
        }
        await super.validar(dto);
    }
}
exports.ValidadorCamposObligatorios = ValidadorCamposObligatorios;
//# sourceMappingURL=validador-campos-obligatorios.js.map