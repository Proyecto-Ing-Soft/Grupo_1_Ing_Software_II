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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const usuario_service_1 = require("../usuario/usuario.service");
const encriptador_1 = require("./encriptador");
const jwt_1 = require("./estrategies/jwt");
let AuthService = class AuthService {
    constructor(usuarios) {
        this.usuarios = usuarios;
        this.encriptador = new encriptador_1.Encriptador();
        this.jwt = new jwt_1.JwtEstrategias();
    }
    async registrar(dto) {
        const existe = await this.usuarios.buscarPorCorreo(dto.correo);
        if (existe)
            throw new common_1.ConflictException('El correo ya está registrado');
        const hash = await this.encriptador.hashear(dto.clave);
        const nuevo = await this.usuarios.crear({
            nombreCompleto: dto.nombreCompleto,
            correo: dto.correo,
            hashClave: hash,
        });
        return this.usuarios.aPublico(nuevo);
    }
    async login(dto) {
        const u = await this.usuarios.buscarPorCorreo(dto.correo);
        if (!u)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const ok = await this.encriptador.comparar(dto.clave, u.hashClave);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const descriptor = { sub: u.id, correo: u.correo, rol: u.rol };
        const accessToken = this.jwt.emitirAccess(descriptor);
        const refreshToken = this.jwt.emitirRefresh(descriptor);
        return { accessToken, refreshToken };
    }
    async renovarAccess(refreshToken) {
        try {
            const payload = this.jwt.verificarRefresh(refreshToken);
            const accessToken = this.jwt.emitirAccess({ sub: payload.sub, correo: payload.correo, rol: payload.rol });
            return { accessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh inválido');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], AuthService);
//# sourceMappingURL=auth.service.js.map