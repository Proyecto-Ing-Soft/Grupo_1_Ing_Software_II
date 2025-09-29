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
let NotificacionPrismaRepo = class NotificacionPrismaRepo {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listarPorUsuario(usuarioId) {
        return this.prisma.notificacion.findMany({
            where: { usuarioId },
            orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
        });
    }
    async marcarLeida(id, usuarioId) {
        const n = await this.prisma.notificacion.findUnique({ where: { id } });
        if (!n)
            throw new common_1.NotFoundException('No existe la notificación');
        if (n.usuarioId !== usuarioId)
            throw new common_1.ForbiddenException('No autorizado');
        if (n.estado === 'LEIDA')
            return;
        await this.prisma.notificacion.update({ where: { id }, data: { estado: 'LEIDA' } });
    }
};
exports.NotificacionPrismaRepo = NotificacionPrismaRepo;
exports.NotificacionPrismaRepo = NotificacionPrismaRepo = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificacionPrismaRepo);
//# sourceMappingURL=notificacion.prisma.repo.js.map