"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notificaciones_controller_1 = require("./notificaciones.controller");
const notificaciones_service_1 = require("./notificaciones.service");
const notificacion_prisma_repo_1 = require("./repos/notificacion.prisma.repo");
const notificador_1 = require("./envio/notificador");
let NotificacionesModule = class NotificacionesModule {
};
exports.NotificacionesModule = NotificacionesModule;
exports.NotificacionesModule = NotificacionesModule = __decorate([
    (0, common_1.Module)({
        controllers: [notificaciones_controller_1.NotificacionesController],
        providers: [prisma_service_1.PrismaService, notificacion_prisma_repo_1.NotificacionPrismaRepo, notificaciones_service_1.NotificacionesService, notificador_1.Notificador],
        exports: [notificador_1.Notificador],
    })
], NotificacionesModule);
//# sourceMappingURL=notificaciones.module.js.map