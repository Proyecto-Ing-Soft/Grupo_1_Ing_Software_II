"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitasModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const citas_service_1 = require("./citas.service");
const citas_controller_1 = require("./citas.controller");
const notificaciones_module_1 = require("../notificiaciones/notificaciones.module");
let CitasModule = class CitasModule {
};
exports.CitasModule = CitasModule;
exports.CitasModule = CitasModule = __decorate([
    (0, common_1.Module)({
        imports: [notificaciones_module_1.NotificacionesModule],
        controllers: [citas_controller_1.CitasController],
        providers: [prisma_service_1.PrismaService, citas_service_1.CitasService],
    })
], CitasModule);
//# sourceMappingURL=citas.module.js.map