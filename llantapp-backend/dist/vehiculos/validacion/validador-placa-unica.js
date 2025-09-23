"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidadorPlacaUnica = void 0;
const validador_base_1 = require("./validador-base");
const common_1 = require("@nestjs/common");
class ValidadorPlacaUnica extends validador_base_1.ValidadorBase {
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async validar(dto) {
        const existe = await this.prisma.vehiculo.findUnique({ where: { placa: dto.placa } });
        if (existe)
            throw new common_1.ConflictException('La placa ya está registrada');
        await super.validar(dto);
    }
}
exports.ValidadorPlacaUnica = ValidadorPlacaUnica;
//# sourceMappingURL=validador-placa-unica.js.map