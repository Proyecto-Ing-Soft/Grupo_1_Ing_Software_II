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
exports.Notificador = void 0;
const common_1 = require("@nestjs/common");
const notificacion_prisma_repo_1 = require("../repos/notificacion.prisma.repo");
let Notificador = class Notificador {
    constructor(repo) {
        this.repo = repo;
    }
    async enviar(data) {
        var _a, _b;
        const cuerpo = `${data.titulo}: ${data.mensaje}`;
        await this.repo.crear({
            usuarioId: data.usuarioId,
            mensaje: cuerpo,
            vehiculoId: (_a = data.vehiculoId) !== null && _a !== void 0 ? _a : null,
            citaId: (_b = data.citaId) !== null && _b !== void 0 ? _b : null,
        });
    }
};
exports.Notificador = Notificador;
exports.Notificador = Notificador = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notificacion_prisma_repo_1.NotificacionPrismaRepo])
], Notificador);
//# sourceMappingURL=notificador.js.map