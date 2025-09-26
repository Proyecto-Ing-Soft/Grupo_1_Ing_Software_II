"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReglaVencimientoLlanta = void 0;
class ReglaVencimientoLlanta {
    constructor(umbralDias) {
        this.umbralDias = umbralDias;
    }
    evaluar(vehiculo, llantas) {
        var _a, _b;
        if (!vehiculo.choferId)
            return null;
        const hoy = new Date();
        for (const l of llantas) {
            const diffMs = new Date(l.fechaVencimiento).getTime() - hoy.getTime();
            const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (dias <= this.umbralDias) {
                return {
                    aplica: true,
                    tipo: 'VENCIMIENTO_LLANTA',
                    mensaje: `Vehículo ${vehiculo.placa}: llanta ${(_a = l.posicion) !== null && _a !== void 0 ? _a : ''} vence en ${Math.max(dias, 0)} días.`,
                    prioridad: dias <= 2 ? 'ALTA' : 'MEDIA',
                    usuarioId: vehiculo.choferId,
                    vehiculoId: vehiculo.id,
                    fechaLimite: (_b = l.fechaVencimiento) !== null && _b !== void 0 ? _b : undefined,
                };
            }
        }
        return null;
    }
}
exports.ReglaVencimientoLlanta = ReglaVencimientoLlanta;
//# sourceMappingURL=regla-vencimiento-llanta.js.map