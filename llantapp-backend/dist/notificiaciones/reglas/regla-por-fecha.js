"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReglaPorFecha = void 0;
class ReglaPorFecha {
    constructor(umbralDias) {
        this.umbralDias = umbralDias;
    }
    evaluar(vehiculo, _llantas) {
        var _a;
        if (!vehiculo.proximoMantenimientoFecha || !vehiculo.choferId)
            return null;
        const hoy = new Date();
        const diffMs = new Date(vehiculo.proximoMantenimientoFecha).getTime() - hoy.getTime();
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (dias <= this.umbralDias) {
            const prioridad = dias <= 2 ? 'ALTA' : 'MEDIA';
            return {
                aplica: true,
                tipo: 'MANTENIMIENTO_FECHA',
                mensaje: `Vehículo ${vehiculo.placa}: mantenimiento por fecha en ${Math.max(dias, 0)} días.`,
                prioridad,
                usuarioId: vehiculo.choferId,
                vehiculoId: vehiculo.id,
                fechaLimite: (_a = vehiculo.proximoMantenimientoFecha) !== null && _a !== void 0 ? _a : undefined,
            };
        }
        return null;
    }
}
exports.ReglaPorFecha = ReglaPorFecha;
//# sourceMappingURL=regla-por-fecha.js.map