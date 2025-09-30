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
const citas_service_1 = require("./citas.service");
const crear_cita_dto_1 = require("./dto/crear-cita.dto");
const asignar_mecanico_dto_1 = require("./dto/asignar-mecanico.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let CitasController = class CitasController {
    constructor(svc) {
        this.svc = svc;
    }
    crear(dto, req) {
        var _a, _b, _c;
        const userId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        if (!Number.isFinite(userId))
            throw new common_1.UnauthorizedException('Usuario no válido');
        return this.svc.crear(dto, userId);
    }
    asignar(id, dto, req) {
        var _a, _b, _c;
        const adminId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        if (!Number.isFinite(adminId))
            throw new common_1.UnauthorizedException('Usuario no válido');
        return this.svc.asignarMecanico(id, dto.mecanicoId, adminId);
    }
    terminar(id, req) {
        var _a, _b, _c;
        const mecanicoId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        if (!Number.isFinite(mecanicoId))
            throw new common_1.UnauthorizedException('Usuario no válido');
        return this.svc.terminar(id, mecanicoId);
    }
    mias(req) {
        var _a, _b, _c;
        const clienteId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        if (!Number.isFinite(clienteId))
            throw new common_1.UnauthorizedException('Usuario no válido');
        return this.svc.listarDelCliente(clienteId);
    }
    asignadas(req) {
        var _a, _b, _c;
        const mecanicoId = Number((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        if (!Number.isFinite(mecanicoId))
            throw new common_1.UnauthorizedException('Usuario no válido');
        return this.svc.listarDelMecanico(mecanicoId);
    }
    pendientes(req) {
        var _a;
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.rol) !== 'ADMIN')
            throw new common_1.ForbiddenException('Solo admin');
        return this.svc.listarPendientes();
    }
};
exports.CitasController = CitasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_cita_dto_1.CrearCitaDto, Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "crear", null);
__decorate([
    (0, common_1.Post)(':id/asignar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asignar_mecanico_dto_1.AsignarMecanicoDto, Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "asignar", null);
__decorate([
    (0, common_1.Post)(':id/terminar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "terminar", null);
__decorate([
    (0, common_1.Get)('mias'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "mias", null);
__decorate([
    (0, common_1.Get)('asignadas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "asignadas", null);
__decorate([
    (0, common_1.Get)('admin/pendientes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CitasController.prototype, "pendientes", null);
exports.CitasController = CitasController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('citas-mantenimiento'),
    __metadata("design:paramtypes", [citas_service_1.CitasService])
], CitasController);
//# sourceMappingURL=citas.controller.js.map