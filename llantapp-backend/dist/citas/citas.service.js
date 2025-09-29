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
exports.CitasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notificador_1 = require("../notificiaciones/envio/notificador");
function toLocalMidnight(dateYYYYMMDD) {
    return new Date(`${dateYYYYMMDD}T00:00:00`);
}
let CitasService = class CitasService {
    constructor(prisma, notificador) {
        this.prisma = prisma;
        this.notificador = notificador;
    }
    async crear(dto, clienteId) {
        const vehiculo = await this.prisma.vehiculo.findFirst({
            where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
            select: { id: true, placa: true },
        });
        if (!vehiculo)
            throw new common_1.ForbiddenException('Ese vehículo no te pertenece');
        const programada = dto.programadaPara && dto.programadaPara.trim().length >= 8
            ? toLocalMidnight(dto.programadaPara.trim())
            : null;
        const cita = await this.prisma.citaMantenimiento.create({
            data: {
                tipo: dto.tipo,
                comentario: dto.comentario.trim(),
                programadaPara: programada,
                clienteId,
                vehiculoId: dto.vehiculoId,
                mecanicoId: dto.mecanicoId,
            },
            include: {
                vehiculo: { select: { placa: true } },
                mecanico: { select: { id: true, nombreCompleto: true } },
            },
        });
        await this.notificador.enviar({
            usuarioId: dto.mecanicoId,
            vehiculoId: vehiculo.id,
            citaId: cita.id,
            mensaje: `Nueva cita #${cita.id} (${dto.tipo}) para el vehículo ${vehiculo.placa}.`,
            prioridad: 'MEDIA',
        });
        await this.notificador.enviar({
            usuarioId: clienteId,
            vehiculoId: vehiculo.id,
            citaId: cita.id,
            mensaje: `Tu cita #${cita.id} fue registrada.`,
            prioridad: 'MEDIA',
        });
        return cita;
    }
    listarPorCliente(clienteId) {
        return this.prisma.citaMantenimiento.findMany({
            where: { clienteId },
            orderBy: { creadoEn: 'desc' },
            include: {
                vehiculo: true,
                mecanico: { select: { id: true, nombreCompleto: true } },
            },
        });
    }
    listarPorMecanico(mecanicoId) {
        return this.prisma.citaMantenimiento.findMany({
            where: {
                mecanicoId,
                estado: { in: ['SOLICITADA', 'ACEPTADA', 'EN_PROGRESO'] },
            },
            orderBy: [{ estado: 'asc' }, { creadoEn: 'desc' }],
            include: {
                vehiculo: true,
                cliente: { select: { id: true, nombreCompleto: true, correo: true } },
            },
        });
    }
    async cambiarEstado(id, mecanicoId, nuevo, permitidos) {
        const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id } });
        if (!cita)
            throw new common_1.NotFoundException('Cita no encontrada');
        if (cita.mecanicoId !== mecanicoId) {
            throw new common_1.ForbiddenException('No eres el mecánico asignado');
        }
        if (!permitidos.includes(cita.estado)) {
            throw new common_1.BadRequestException(`Transición no permitida desde ${cita.estado} a ${nuevo}`);
        }
        const actualizada = await this.prisma.citaMantenimiento.update({
            where: { id },
            data: { estado: nuevo },
        });
        const msgPorEstado = {
            SOLICITADA: 'Tu cita fue registrada.',
            ACEPTADA: 'Tu cita fue aceptada. 🔵',
            EN_PROGRESO: 'Tu mantenimiento está en progreso. 🟣',
            TERMINADA: 'Mantenimiento terminado. ✅',
        };
        await this.notificador.enviar({
            usuarioId: actualizada.clienteId,
            vehiculoId: actualizada.vehiculoId,
            citaId: actualizada.id,
            mensaje: `Cita #${id}: ${msgPorEstado[nuevo]}`,
            prioridad: 'MEDIA',
        });
        return actualizada;
    }
};
exports.CitasService = CitasService;
exports.CitasService = CitasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificador_1.Notificador])
], CitasService);
//# sourceMappingURL=citas.service.js.map