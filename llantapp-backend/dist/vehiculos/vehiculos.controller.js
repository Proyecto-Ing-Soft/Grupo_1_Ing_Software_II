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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiculosController = void 0;
const common_1 = require("@nestjs/common");
const vehiculos_service_1 = require("./vehiculos.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const crear_vehiculo_dto_1 = require("./dto/crear-vehiculo.dto");
let VehiculosController = class VehiculosController {
    constructor(svc) {
        this.svc = svc;
    }
    async mios(req) {
        var _a, _b, _c;
        const uid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        return this.svc.listarDelPropietario(uid);
    }
    async crear(dto, req) {
        var _a, _b, _c;
        const uid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        return this.svc.crear(dto, uid);
    }
};
exports.VehiculosController = VehiculosController;
__decorate([
    (0, common_1.Get)('mios'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehiculosController.prototype, "mios", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_vehiculo_dto_1.CrearVehiculoDto, Object]),
    __metadata("design:returntype", Promise)
], VehiculosController.prototype, "crear", null);
exports.VehiculosController = VehiculosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('vehiculos'),
    __metadata("design:paramtypes", [vehiculos_service_1.VehiculosService])
], VehiculosController);
//# sourceMappingURL=vehiculos.controller.js.map