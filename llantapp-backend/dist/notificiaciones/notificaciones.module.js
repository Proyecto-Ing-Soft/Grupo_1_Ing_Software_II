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
const schedule_1 = require("@nestjs/schedule");
const notificaciones_controller_1 = require("./notificaciones.controller");
const notificaciones_service_1 = require("./servicio/notificaciones.service");
const evaluador_reglas_service_1 = require("./servicio/evaluador-reglas.service");
const prisma_service_1 = require("../prisma/prisma.service");
const notificacion_prisma_repo_1 = require("./repos/notificacion.prisma.repo");
const notificador_1 = require("./envio/notificador");
let NotificacionesModule = class NotificacionesModule {
};
exports.NotificacionesModule = NotificacionesModule;
exports.NotificacionesModule = NotificacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [notificaciones_controller_1.NotificacionesController],
        providers: [
            prisma_service_1.PrismaService,
            notificaciones_service_1.NotificacionesService,
            evaluador_reglas_service_1.EvaluadorReglasService,
            notificador_1.Notificador,
            { provide: 'INotificacionRepo', useClass: notificacion_prisma_repo_1.NotificacionPrismaRepo },
            { provide: notificacion_prisma_repo_1.NotificacionPrismaRepo, useClass: notificacion_prisma_repo_1.NotificacionPrismaRepo },
        ],
        exports: [],
    })
], NotificacionesModule);
//# sourceMappingURL=notificaciones.module.js.map