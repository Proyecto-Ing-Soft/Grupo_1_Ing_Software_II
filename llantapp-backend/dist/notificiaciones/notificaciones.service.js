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
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
const notificacion_prisma_repo_1 = require("./repos/notificacion.prisma.repo");
let NotificacionesService = class NotificacionesService {
    constructor(repo) {
        this.repo = repo;
    }
    async listarPorUsuario(usuarioId) {
        const filas = await this.repo.listarPorUsuario(usuarioId);
        return filas.map(n => {
            var _a, _b;
            return ({
                id: n.id,
                mensaje: n.mensaje,
                estado: n.estado,
                creadoEn: n.creadoEn.toISOString(),
                vehiculoId: (_a = n.vehiculoId) !== null && _a !== void 0 ? _a : null,
                citaId: (_b = n.citaId) !== null && _b !== void 0 ? _b : null,
            });
        });
    }
    async marcarLeida(id, usuarioId) {
        await this.repo.marcarLeida(id, usuarioId);
        return { ok: true };
    }
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notificacion_prisma_repo_1.NotificacionPrismaRepo])
], NotificacionesService);
//# sourceMappingURL=notificaciones.service.js.map