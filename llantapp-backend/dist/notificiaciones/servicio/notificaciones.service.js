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
exports.NotificacionesService = void 0;
const common_1 = require("@nestjs/common");
let NotificacionesService = class NotificacionesService {
    constructor(repo) {
        this.repo = repo;
    }
    listarMias(usuarioId) {
        return this.repo.listarPorUsuario(usuarioId);
    }
    async marcarLeida(id, usuarioId) {
        const lista = await this.repo.listarPorUsuario(usuarioId);
        if (!lista.find(n => n.id === id)) {
            throw new common_1.ForbiddenException('No puedes cambiar esta notificación');
        }
        await this.repo.marcarLeida(id, usuarioId);
        return { ok: true };
    }
};
exports.NotificacionesService = NotificacionesService;
exports.NotificacionesService = NotificacionesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('INotificacionRepo')),
    __metadata("design:paramtypes", [Object])
], NotificacionesService);
//# sourceMappingURL=notificaciones.service.js.map