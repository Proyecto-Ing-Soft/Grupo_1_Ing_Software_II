"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtEstrategias = void 0;
const jwt = require("jsonwebtoken");
class JwtEstrategias {
    emitirAccess(descriptor) {
        return jwt.sign(descriptor, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_TTL || '15m' });
    }
    emitirRefresh(descriptor) {
        return jwt.sign(descriptor, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_TTL || '7d' });
    }
    verificarRefresh(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
}
exports.JwtEstrategias = JwtEstrategias;
//# sourceMappingURL=jwt.js.map