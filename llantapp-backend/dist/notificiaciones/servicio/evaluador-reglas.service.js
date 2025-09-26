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
var _a;
var EvaluadorReglasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluadorReglasService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const notificador_1 = require("../envio/notificador");
const regla_por_kilometraje_1 = require("../reglas/regla-por-kilometraje");
const regla_por_fecha_1 = require("../reglas/regla-por-fecha");
const regla_vencimiento_llanta_1 = require("../reglas/regla-vencimiento-llanta");
let EvaluadorReglasService = EvaluadorReglasService_1 = class EvaluadorReglasService {
    constructor(prisma, notificador) {
        var _a, _b;
        this.prisma = prisma;
        this.notificador = notificador;
        this.logger = new common_1.Logger(EvaluadorReglasService_1.name);
        const umbralKm = parseInt((_a = process.env.UMBRAL_KM) !== null && _a !== void 0 ? _a : '1000', 10);
        const umbralDias = parseInt((_b = process.env.UMBRAL_DIAS) !== null && _b !== void 0 ? _b : '7', 10);
        this.reglas = [
            new regla_por_kilometraje_1.ReglaPorKilometraje(umbralKm),
            new regla_por_fecha_1.ReglaPorFecha(umbralDias),
            new regla_vencimiento_llanta_1.ReglaVencimientoLlanta(umbralDias),
        ];
    }
    async evaluarTodo() {
        this.logger.log('Iniciando evaluación de reglas de mantenimiento/vencimientos...');
        const vehiculos = await this.prisma.vehiculo.findMany({
            include: {
                llantas: true,
            },
        });
        for (const v of vehiculos) {
            for (const regla of this.reglas) {
                const resultado = regla.evaluar(v, v.llantas);
                if (resultado === null || resultado === void 0 ? void 0 : resultado.aplica) {
                    await this.notificador.enviar(resultado);
                }
            }
        }
        this.logger.log('Evaluación de reglas finalizada.');
    }
};
exports.EvaluadorReglasService = EvaluadorReglasService;
__decorate([
    (0, schedule_1.Cron)((_a = process.env.CRON_EVALUACION) !== null && _a !== void 0 ? _a : '*/30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EvaluadorReglasService.prototype, "evaluarTodo", null);
exports.EvaluadorReglasService = EvaluadorReglasService = EvaluadorReglasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificador_1.Notificador])
], EvaluadorReglasService);
//# sourceMappingURL=evaluador-reglas.service.js.map