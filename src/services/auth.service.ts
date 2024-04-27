import { Request, Response, NextFunction } from "express";

import passport from "passport";
import {registerSchema} from "../utils/validators";
import {UserModel} from "../models/user";
import HttpException from "../exceptions/HttpException";
import generateJWT from "../utils/jwt";

class AuthService {

    public requireLocalAuth = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (err: Error | null, user: any, info: any) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(422).send(info);
            }
            req.user = user;
            next();
        })(req, res, next);
    };

    public afterLocalLogin = (req: Request, res: Response) => {
        try {
            const token = generateJWT(req.user);
            const me = req.user!;
            res.json({token, me});
        } catch (err) {
            throw new HttpException(401, "Authentication Failed")
        }
    };

    public after3rdLogin = (req: Request, res: Response) => {
        try {
            const token = generateJWT(req.user);
            res.cookie('x-auth-cookie', token);
            res.redirect(req.url); // todo: verify this
        } catch (err) {
            throw new HttpException(401, "Authentication Failed")
        }
    };

    public localRegister = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = registerSchema.validate(req.body)

        if (error) {
            return res.status(442).send({ message: error.details[0].message });
        }

        const { email, password, name, username } = req.body;
        try {
            const existingUser = await UserModel.findOne({ email });

            if (existingUser) {
                return res.status(422).send({ message: 'Email is in use' });
            }

            try {
                const newUser = new UserModel({
                    provider: 'email',
                    email,
                    password,
                    username,
                    name,
                    avatar: "", // todo: add default
                });

                newUser.registerUser(newUser, (err: Error | null, user: any) => {
                    if (err) throw err;
                    res.json({ message: 'Register success.' }); // just redirect to login
                });
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    }

    public logout = (req: Request, res: Response) => {
        req.logout((err) => {});
        res.send(false);
    }

}

export default AuthService