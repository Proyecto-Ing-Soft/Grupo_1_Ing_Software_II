"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReglaPorKilometraje = void 0;
class ReglaPorKilometraje {
    constructor(umbralKm) {
        this.umbralKm = umbralKm;
    }
    evaluar(vehiculo, _llantas) {
        if (!vehiculo.proximoMantenimientoKm || !vehiculo.choferId)
            return null;
        const resta = vehiculo.proximoMantenimientoKm - vehiculo.kms;
        if (resta < 0 || resta <= this.umbralKm) {
            const prioridad = resta <= 200 ? 'ALTA' : (resta <= this.umbralKm ? 'MEDIA' : 'BAJA');
            return {
                aplica: true,
                tipo: 'MANTENIMIENTO_KM',
                mensaje: `Vehículo ${vehiculo.placa}: mantenimiento por km cercano (${vehiculo.kms}/${vehiculo.proximoMantenimientoKm}).`,
                prioridad,
                usuarioId: vehiculo.choferId,
                vehiculoId: vehiculo.id,
            };
        }
        return null;
    }
}
exports.ReglaPorKilometraje = ReglaPorKilometraje;
//# sourceMappingURL=regla-por-kilometraje.js.map