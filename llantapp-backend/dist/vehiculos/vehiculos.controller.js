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
const crear_vehiculo_dto_1 = require("./dto/crear-vehiculo.dto");
const rol_requerido_decorator_1 = require("../common/decorators/rol-requerido.decorator");
const rol_enum_1 = require("../common/enums/rol.enum");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let VehiculosController = class VehiculosController {
    constructor(servicio) {
        this.servicio = servicio;
    }
    async crear(dto, req) {
        var _a, _b, _c;
        const uidRaw = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub) !== null && _b !== void 0 ? _b : (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
        const uid = Number(uidRaw);
        if (!Number.isFinite(uid)) {
            throw new common_1.UnauthorizedException('Token sin id válido');
        }
        return this.servicio.crear(dto, uid);
    }
};
exports.VehiculosController = VehiculosController;
__decorate([
    (0, common_1.Post)(),
    (0, rol_requerido_decorator_1.RolRequerido)(rol_enum_1.Rol.ADMIN, rol_enum_1.Rol.MECANICO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_vehiculo_dto_1.CrearVehiculoDto, Object]),
    __metadata("design:returntype", Promise)
], VehiculosController.prototype, "crear", null);
exports.VehiculosController = VehiculosController = __decorate([
    (0, common_1.Controller)('vehiculos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [vehiculos_service_1.VehiculosService])
], VehiculosController);
//# sourceMappingURL=vehiculos.controller.js.map