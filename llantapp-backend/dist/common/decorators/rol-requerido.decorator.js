"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolRequerido = exports.ROL_REQUERIDO_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROL_REQUERIDO_KEY = 'rolesRequeridos';
const RolRequerido = (...roles) => (0, common_1.SetMetadata)(exports.ROL_REQUERIDO_KEY, roles);
exports.RolRequerido = RolRequerido;
//# sourceMappingURL=rol-requerido.decorator.js.map