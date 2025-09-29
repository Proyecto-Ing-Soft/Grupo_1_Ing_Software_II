"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearCitaDto = exports.TipoMantenimiento = void 0;
const class_validator_1 = require("class-validator");
var TipoMantenimiento;
(function (TipoMantenimiento) {
    TipoMantenimiento["PREVENTIVO"] = "PREVENTIVO";
    TipoMantenimiento["CORRECTIVO"] = "CORRECTIVO";
    TipoMantenimiento["LEGAL_ITV"] = "LEGAL_ITV";
    TipoMantenimiento["EXTRAS"] = "EXTRAS";
})(TipoMantenimiento || (exports.TipoMantenimiento = TipoMantenimiento = {}));
class CrearCitaDto {
}
exports.CrearCitaDto = CrearCitaDto;
__decorate([
    (0, class_validator_1.IsEnum)(TipoMantenimiento),
    __metadata("design:type", String)
], CrearCitaDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CrearCitaDto.prototype, "vehiculoId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CrearCitaDto.prototype, "mecanicoId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(5, 1000),
    __metadata("design:type", String)
], CrearCitaDto.prototype, "comentario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, { message: 'programadaPara debe ser YYYY-MM-DD' }),
    __metadata("design:type", String)
], CrearCitaDto.prototype, "programadaPara", void 0);
//# sourceMappingURL=crear-cita.dto.js.map