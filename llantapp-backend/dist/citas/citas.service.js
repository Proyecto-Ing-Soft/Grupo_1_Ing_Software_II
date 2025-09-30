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
const client_1 = require("@prisma/client");
const notificador_1 = require("../notificaciones/envio/notificador");
let CitasService = class CitasService {
    constructor(prisma, noti) {
        this.prisma = prisma;
        this.noti = noti;
    }
    toYMD(d) { return d.toISOString().slice(0, 10); }
    async crear(dto, clienteId) {
        var _a, _b, _c, _d;
        if (!dto.programadaPara)
            throw new common_1.BadRequestException('Falta fecha');
        if (!dto.placaPreliminar || !dto.marcaPreliminar || !dto.modeloPreliminar)
            throw new common_1.BadRequestException('Faltan datos del vehículo');
        const cita = await this.prisma.citaMantenimiento.create({
            data: {
                tipo: dto.tipo,
                comentario: (_a = dto.comentario) !== null && _a !== void 0 ? _a : '',
                programadaPara: new Date(dto.programadaPara + 'T00:00:00Z'),
                estado: client_1.EstadoCita.SOLICITADA,
                clienteId,
                vehiculoId: null,
                placaPreliminar: dto.placaPreliminar.trim().toUpperCase(),
                marcaPreliminar: dto.marcaPreliminar.trim(),
                modeloPreliminar: dto.modeloPreliminar.trim(),
                anioPreliminar: (_b = dto.anioPreliminar) !== null && _b !== void 0 ? _b : null,
                colorPreliminar: (_c = dto.colorPreliminar) !== null && _c !== void 0 ? _c : null,
                vinPreliminar: (_d = dto.vinPreliminar) !== null && _d !== void 0 ? _d : null,
            },
        });
        const admins = await this.prisma.usuario.findMany({ where: { rol: 'ADMIN' } });
        await Promise.all(admins.map(a => this.noti.enviar({
            usuarioId: a.id,
            citaId: cita.id,
            vehiculoId: null,
            titulo: 'Nueva cita pendiente',
            mensaje: `Cita #${cita.id} solicitada por cliente #${clienteId}`,
        })));
        await this.noti.enviar({
            usuarioId: clienteId,
            citaId: cita.id,
            vehiculoId: null,
            titulo: 'Solicitud registrada',
            mensaje: 'Recibimos tu solicitud de mantenimiento. Un administrador la revisará y asignará un mecánico pronto.',
        });
        return cita;
    }
    async asignarMecanico(citaId, mecanicoId, _adminId) {
        var _a, _b;
        const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id: citaId } });
        if (!cita)
            throw new common_1.BadRequestException('Cita no existe');
        if (cita.estado === client_1.EstadoCita.TERMINADA)
            throw new common_1.BadRequestException('Cita ya terminada');
        const actualizada = await this.prisma.citaMantenimiento.update({
            where: { id: citaId },
            data: { mecanicoId, estado: client_1.EstadoCita.EN_PROGRESO },
        });
        const fecha = actualizada.programadaPara
            ? new Date(actualizada.programadaPara).toLocaleDateString('es-PE')
            : 'fecha programada';
        await this.noti.enviar({
            usuarioId: actualizada.clienteId,
            citaId: actualizada.id,
            vehiculoId: (_a = actualizada.vehiculoId) !== null && _a !== void 0 ? _a : null,
            titulo: 'Mantenimiento en proceso',
            mensaje: `Se asignó un mecánico a tu cita #${actualizada.id} para el ${fecha}. Tu mantenimiento está en curso según lo programado.`,
        });
        await this.noti.enviar({
            usuarioId: mecanicoId,
            citaId: actualizada.id,
            vehiculoId: (_b = actualizada.vehiculoId) !== null && _b !== void 0 ? _b : null,
            titulo: 'Mantenimiento asignado',
            mensaje: `Se te asignó la cita #${actualizada.id}`,
        });
        return actualizada;
    }
    async terminar(citaId, mecanicoId) {
        var _a, _b, _c, _d, _e, _f;
        const cita = await this.prisma.citaMantenimiento.findUnique({ where: { id: citaId } });
        if (!cita)
            throw new common_1.BadRequestException('Cita no existe');
        if (cita.mecanicoId !== mecanicoId)
            throw new common_1.ForbiddenException('No eres el mecánico asignado');
        if (cita.estado !== client_1.EstadoCita.EN_PROGRESO)
            throw new common_1.BadRequestException('La cita no está en proceso');
        if (!cita.programadaPara)
            throw new common_1.BadRequestException('La cita no tiene fecha programada');
        const hoy = this.toYMD(new Date());
        const programada = this.toYMD(new Date(cita.programadaPara));
        if (hoy !== programada)
            throw new common_1.BadRequestException('Solo se puede terminar el día programado');
        let vehiculoId = (_a = cita.vehiculoId) !== null && _a !== void 0 ? _a : null;
        if (!vehiculoId) {
            const cliente = await this.prisma.usuario.findUnique({
                where: { id: cita.clienteId },
                select: { id: true, empresaId: true },
            });
            const vehiculo = await this.prisma.vehiculo.create({
                data: {
                    placa: cita.placaPreliminar,
                    marca: cita.marcaPreliminar,
                    modelo: cita.modeloPreliminar,
                    anio: (_b = cita.anioPreliminar) !== null && _b !== void 0 ? _b : new Date().getFullYear(),
                    color: (_c = cita.colorPreliminar) !== null && _c !== void 0 ? _c : 'SIN-REGISTRO',
                    vin: (_d = cita.vinPreliminar) !== null && _d !== void 0 ? _d : null,
                    propietarioUsuarioId: cita.clienteId,
                    creadoPorId: mecanicoId,
                    empresaId: (_e = cliente === null || cliente === void 0 ? void 0 : cliente.empresaId) !== null && _e !== void 0 ? _e : null,
                },
            });
            vehiculoId = vehiculo.id;
            await this.prisma.citaMantenimiento.update({
                where: { id: citaId },
                data: { vehiculoId },
            });
        }
        const terminada = await this.prisma.citaMantenimiento.update({
            where: { id: citaId },
            data: { estado: client_1.EstadoCita.TERMINADA },
        });
        const veh = await this.prisma.vehiculo.findUnique({
            where: { id: vehiculoId },
            select: { placa: true },
        });
        await this.noti.enviar({
            usuarioId: terminada.clienteId,
            citaId: terminada.id,
            vehiculoId: vehiculoId,
            titulo: 'Mantenimiento completado',
            mensaje: `El mantenimiento del vehículo con placa ${(_f = veh === null || veh === void 0 ? void 0 : veh.placa) !== null && _f !== void 0 ? _f : '—'} ha finalizado. Puedes recogerlo cuando gustes. ¡Gracias por confiar en nosotros!`,
        });
        return terminada;
    }
    async listarDelCliente(clienteId) {
        return this.prisma.citaMantenimiento.findMany({
            where: { clienteId },
            select: {
                id: true, tipo: true, estado: true, comentario: true, programadaPara: true,
                vehiculo: { select: { placa: true } },
                placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
            },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async listarDelMecanico(mecanicoId) {
        return this.prisma.citaMantenimiento.findMany({
            where: { mecanicoId },
            select: {
                id: true, tipo: true, estado: true, comentario: true, programadaPara: true,
                vehiculo: { select: { placa: true } },
                cliente: { select: { nombreCompleto: true } },
                placaPreliminar: true, marcaPreliminar: true, modeloPreliminar: true,
            },
            orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'desc' }],
        });
    }
    async listarPendientes() {
        return this.prisma.citaMantenimiento.findMany({
            where: { estado: client_1.EstadoCita.SOLICITADA },
            select: {
                id: true,
                tipo: true,
                estado: true,
                comentario: true,
                programadaPara: true,
                vehiculo: { select: { placa: true } },
                placaPreliminar: true,
                marcaPreliminar: true,
                modeloPreliminar: true,
                cliente: { select: { id: true, nombreCompleto: true } },
            },
            orderBy: [{ creadoEn: 'desc' }],
        });
    }
};
exports.CitasService = CitasService;
exports.CitasService = CitasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notificador_1.Notificador])
], CitasService);
//# sourceMappingURL=citas.service.js.map