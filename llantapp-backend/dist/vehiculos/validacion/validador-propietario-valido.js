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
exports.ValidadorPropietarioValido = void 0;
const common_1 = require("@nestjs/common");
const validador_base_1 = require("./validador-base");
const prisma_service_1 = require("../../prisma/prisma.service");
let ValidadorPropietarioValido = class ValidadorPropietarioValido extends validador_base_1.ValidadorBase {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async validar(dto) {
        if (!dto.propietarioUsuarioId)
            return 'Propietario inválido';
        const u = await this.prisma.usuario.findUnique({
            where: { id: dto.propietarioUsuarioId },
            select: { id: true, rol: true, empresaId: true },
        });
        if (!u)
            return 'Propietario no existe';
        if (u.rol !== 'CHOFER' && u.rol !== 'EMPRESA') {
            return 'El propietario debe ser CHOFER o EMPRESA';
        }
        return null;
    }
};
exports.ValidadorPropietarioValido = ValidadorPropietarioValido;
exports.ValidadorPropietarioValido = ValidadorPropietarioValido = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ValidadorPropietarioValido);
//# sourceMappingURL=validador-propietario-valido.js.map