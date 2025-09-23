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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const usuario_service_1 = require("../usuario/usuario.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const jwt_1 = require("./estrategies/jwt");
let AuthController = class AuthController {
    constructor(usuarios) {
        this.usuarios = usuarios;
        this.jwt = new jwt_1.JwtEstrategias();
    }
    async login(body, res) {
        const u = await this.usuarios.buscarPorCorreo(body.correo);
        if (!u)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const ok = body.clave && u.hashClave;
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const payload = {
            sub: u.id, rol: u.rol, nombreCompleto: u.nombreCompleto, correo: u.correo,
        };
        const accessToken = this.jwt.emitirAccess(payload);
        const refreshToken = this.jwt.emitirRefresh({ sub: u.id });
        res.cookie('rt', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { accessToken };
    }
    async refresh(req) {
        var _a, _b;
        const rt = (((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.rt) || ((_b = req.signedCookies) === null || _b === void 0 ? void 0 : _b.rt));
        if (!rt)
            throw new common_1.UnauthorizedException('Sin refresh token');
        const dec = this.jwt.verificarRefresh(rt);
        const u = await this.usuarios.buscarPorId(Number(dec.sub));
        if (!u)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        const payload = {
            sub: u.id, rol: u.rol, nombreCompleto: u.nombreCompleto, correo: u.correo,
        };
        const accessToken = this.jwt.emitirAccess(payload);
        return { accessToken };
    }
    async perfil(req) {
        const user = req.user;
        const u = await this.usuarios.buscarPorId(Number(user.sub));
        if (!u)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        return this.usuarios.aPublico(u);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('perfil'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "perfil", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map