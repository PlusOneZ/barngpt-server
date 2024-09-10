"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBusinessJWT = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const secretOrKey = process.env.JWT_SECRET;
function generateJWT(user) {
    try {
        return jsonwebtoken_1.default.sign({
            id: user._id,
            provider: user.provider,
            email: user.email,
        }, secretOrKey, {
            expiresIn: '12h'
        });
    }
    catch (e) {
        throw new HttpException_1.default(401, "Can't generate JWT for user.");
    }
}
exports.generateJWT = generateJWT;
function generateBusinessJWT(user) {
    try {
        return jsonwebtoken_1.default.sign({
            id: user._id,
            identifier: user.identifier,
            description: user.description,
            enableIpCheck: user.enableIpCheck,
        }, secretOrKey, {
            expiresIn: '45d'
        });
    }
    catch (e) {
        throw new HttpException_1.default(401, "Can't generate JWT for business user.");
    }
}
exports.generateBusinessJWT = generateBusinessJWT;
//# sourceMappingURL=jwt.js.map