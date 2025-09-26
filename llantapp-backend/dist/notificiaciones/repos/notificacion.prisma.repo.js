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
exports.NotificacionPrismaRepo = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let NotificacionPrismaRepo = class NotificacionPrismaRepo {
    constructor(prisma) {
        this.prisma = prisma;
    }
    crear(data) {
        return this.prisma.notificacion.create({
            data: {
                usuarioId: data.usuarioId,
                vehiculoId: data.vehiculoId,
                tipo: data.tipo,
                mensaje: data.mensaje,
                prioridad: data.prioridad,
                fechaLimite: data.fechaLimite,
            },
        });
    }
    listarPorUsuario(usuarioId) {
        return this.prisma.notificacion.findMany({
            where: { usuarioId },
            orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
        });
    }
    async marcarLeida(id, usuarioId) {
        await this.prisma.notificacion.update({
            where: { id },
            data: { estado: client_1.EstadoNotificacion.LEIDA },
        });
    }
    async existePendienteIgual(usuarioId, vehiculoId, tipo, mensaje) {
        const existe = await this.prisma.notificacion.findFirst({
            where: {
                usuarioId,
                vehiculoId: vehiculoId !== null && vehiculoId !== void 0 ? vehiculoId : undefined,
                tipo: tipo,
                mensaje,
                estado: client_1.EstadoNotificacion.PENDIENTE,
            },
            select: { id: true },
        });
        return !!existe;
    }
};
exports.NotificacionPrismaRepo = NotificacionPrismaRepo;
exports.NotificacionPrismaRepo = NotificacionPrismaRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacionPrismaRepo);
//# sourceMappingURL=notificacion.prisma.repo.js.map