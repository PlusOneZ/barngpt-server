import jwt, { Secret } from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";

const secretOrKey: Secret = process.env.JWT_SECRET!

export function generateJWT(user: any) {
    try {
        return jwt.sign({
            id: user._id,
            provider: user.provider,
            email: user.email,
        }, secretOrKey, {
            expiresIn: '12h'
        });
    } catch (e) {
        throw new HttpException(401, "Can't generate JWT for user.")
    }
}

export function generateBusinessJWT(user: any) {
    try {
        return jwt.sign({
            id: user._id,
            identifier: user.identifier,
            description: user.description,
            enableIpCheck: user.enableIpCheck,
        }, secretOrKey, {
            expiresIn: '45d'
        });
    } catch (e) {
        throw new HttpException(401, "Can't generate JWT for business user.")
    }
}