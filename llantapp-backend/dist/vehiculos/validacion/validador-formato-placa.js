"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorFormatoPlaca = void 0;
const common_1 = require("@nestjs/common");
const validador_base_1 = require("./validador-base");
const RE_PLACA = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
let ValidadorFormatoPlaca = class ValidadorFormatoPlaca extends validador_base_1.ValidadorBase {
    async validar(dto) {
        if (!dto.placa)
            return 'Placa inválida';
        const placa = dto.placa.trim().toUpperCase();
        if (!RE_PLACA.test(placa)) {
            return 'Formato de placa inválido. Ej: ABC-123';
        }
        return null;
    }
};
exports.ValidadorFormatoPlaca = ValidadorFormatoPlaca;
exports.ValidadorFormatoPlaca = ValidadorFormatoPlaca = __decorate([
    (0, common_1.Injectable)()
], ValidadorFormatoPlaca);
//# sourceMappingURL=validador-formato-placa.js.map