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
exports.VehiculosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tokens_1 = require("./validacion/tokens");
let VehiculosService = class VehiculosService {
    constructor(prisma, validadores) {
        this.prisma = prisma;
        this.validadores = validadores;
    }
    listarDelPropietario(usuarioId) {
        return this.prisma.vehiculo.findMany({
            where: { propietarioUsuarioId: usuarioId },
            select: { id: true, placa: true, marca: true, modelo: true },
            orderBy: { id: 'desc' },
        });
    }
    async crear(dto, creadorId) {
        var _a, _b;
        const errores = [];
        for (const v of this.validadores) {
            const msg = await v.validar(dto);
            if (msg)
                errores.push(...(Array.isArray(msg) ? msg : [msg]));
        }
        if (errores.length)
            throw new common_1.BadRequestException(errores.join(' | '));
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: creadorId },
            select: { empresaId: true },
        });
        return this.prisma.vehiculo.create({
            data: {
                placa: dto.placa.trim().toUpperCase(),
                marca: dto.marca.trim(),
                modelo: dto.modelo.trim(),
                anio: dto.anio,
                color: dto.color.trim(),
                vin: ((_a = dto.vin) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                propietarioUsuarioId: creadorId,
                creadoPorId: creadorId,
                empresaId: (_b = usuario === null || usuario === void 0 ? void 0 : usuario.empresaId) !== null && _b !== void 0 ? _b : null,
            },
            select: { id: true, placa: true, marca: true, modelo: true },
        });
    }
};
exports.VehiculosService = VehiculosService;
exports.VehiculosService = VehiculosService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(tokens_1.VEHICULO_VALIDADORES)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Array])
], VehiculosService);
//# sourceMappingURL=vehiculos.service.js.map