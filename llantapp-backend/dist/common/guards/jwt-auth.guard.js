"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        var _a;
        const req = context.switchToHttp().getRequest();
        const auth = (_a = req.headers['authorization']) !== null && _a !== void 0 ? _a : '';
        if (!auth.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Falta token');
        }
        const token = auth.slice('Bearer '.length).trim();
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new common_1.UnauthorizedException('Config de token no disponible');
        }
        try {
            const payload = jwt.verify(token, secret);
            const idNum = typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub;
            if (!Number.isFinite(idNum))
                throw new common_1.UnauthorizedException('Token inválido');
            req.user = {
                ...payload,
                id: idNum,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido o expirado');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map