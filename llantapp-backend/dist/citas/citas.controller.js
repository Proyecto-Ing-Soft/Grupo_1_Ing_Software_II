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
exports.CitasController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const citas_service_1 = require("./citas.service");
const crear_cita_dto_1 = require("./dto/crear-cita.dto");
let CitasController = class CitasController {
    constructor(servicio) {
        this.servicio = servicio;
    }
    async crear(dto, req) {
        var _a, _b, _c;
        const uid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        return this.servicio.crear(dto, uid);
    }
    async mias(req) {
        var _a, _b, _c;
        const uid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        return this.servicio.listarPorCliente(uid);
    }
    async asignadas(req) {
        var _a, _b, _c;
        const mid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        return this.servicio.listarPorMecanico(mid);
    }
    async aceptar(id, req) {
        var _a, _b, _c;
        const mid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        const permitidos = ['SOLICITADA'];
        return this.servicio.cambiarEstado(id, mid, 'ACEPTADA', permitidos);
    }
    async iniciar(id, req) {
        var _a, _b, _c;
        const mid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        const permitidos = ['ACEPTADA'];
        return this.servicio.cambiarEstado(id, mid, 'EN_PROGRESO', permitidos);
    }
    async terminar(id, req) {
        var _a, _b, _c;
        const mid = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        const permitidos = ['EN_PROGRESO'];
        return this.servicio.cambiarEstado(id, mid, 'TERMINADA', permitidos);
    }
};
exports.CitasController = CitasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_cita_dto_1.CrearCitaDto, Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)('mias'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "mias", null);
__decorate([
    (0, common_1.Get)('asignadas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "asignadas", null);
__decorate([
    (0, common_1.Post)(':id/aceptar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "aceptar", null);
__decorate([
    (0, common_1.Post)(':id/iniciar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "iniciar", null);
__decorate([
    (0, common_1.Post)(':id/terminar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CitasController.prototype, "terminar", null);
exports.CitasController = CitasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('citas'),
    __metadata("design:paramtypes", [citas_service_1.CitasService])
], CitasController);
//# sourceMappingURL=citas.controller.js.map