"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiculoModule = void 0;
const common_1 = require("@nestjs/common");
const vehiculos_service_1 = require("./vehiculos.service");
const vehiculos_controller_1 = require("./vehiculos.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const validador_campos_obligatorios_1 = require("./validacion/validador-campos-obligatorios");
const validador_formato_placa_1 = require("./validacion/validador-formato-placa");
const validador_placa_unica_1 = require("./validacion/validador-placa-unica");
const tokens_1 = require("./validacion/tokens");
function construirCadena(prisma) {
    const v1 = new validador_campos_obligatorios_1.ValidadorCamposObligatorios();
    const v2 = v1.encadenar(new validador_formato_placa_1.ValidadorFormatoPlaca());
    v2.encadenar(new validador_placa_unica_1.ValidadorPlacaUnica(prisma));
    return v1;
}
let VehiculoModule = class VehiculoModule {
};
exports.VehiculoModule = VehiculoModule;
exports.VehiculoModule = VehiculoModule = __decorate([
    (0, common_1.Module)({
        controllers: [vehiculos_controller_1.VehiculosController],
        providers: [
            prisma_service_1.PrismaService,
            vehiculos_service_1.VehiculosService,
            {
                provide: tokens_1.VALIDADOR_VEHICULO,
                inject: [prisma_service_1.PrismaService],
                useFactory: (prisma) => construirCadena(prisma),
            },
        ],
    })
], VehiculoModule);
//# sourceMappingURL=vehiculo.module.js.map