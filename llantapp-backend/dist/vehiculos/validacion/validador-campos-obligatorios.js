"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorCamposObligatorios = void 0;
const common_1 = require("@nestjs/common");
const validador_base_1 = require("./validador-base");
let ValidadorCamposObligatorios = class ValidadorCamposObligatorios extends validador_base_1.ValidadorBase {
    async validar(dto) {
        const faltan = [];
        if (this.isEmpty(dto.placa))
            faltan.push('placa');
        if (this.isEmpty(dto.marca))
            faltan.push('marca');
        if (this.isEmpty(dto.modelo))
            faltan.push('modelo');
        if (dto.anio === undefined || dto.anio === null)
            faltan.push('anio');
        if (this.isEmpty(dto.color))
            faltan.push('color');
        if (faltan.length)
            return `Faltan campos: ${faltan.join(', ')}`;
        if (dto.anio < 1950 || dto.anio > new Date().getFullYear() + 1) {
            return 'Año fuera de rango';
        }
        return null;
    }
};
exports.ValidadorCamposObligatorios = ValidadorCamposObligatorios;
exports.ValidadorCamposObligatorios = ValidadorCamposObligatorios = __decorate([
    (0, common_1.Injectable)()
], ValidadorCamposObligatorios);
//# sourceMappingURL=validador-campos-obligatorios.js.map