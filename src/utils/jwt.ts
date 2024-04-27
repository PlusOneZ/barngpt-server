import jwt, { Secret } from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";

const secretOrKey: Secret = process.env.JWT_SECRET!

export default function generateJWT(user: any) {
    try {
        return jwt.sign({
            expiresIn: '12h',
            id: user._id,
            provider: user.provider,
            email: user.email,
        }, secretOrKey);
    } catch (e) {
        throw new HttpException(401, "User Auth Failed")
    }
}