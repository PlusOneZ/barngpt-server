import { Request, Response, NextFunction } from "express";

import passport from "passport";
import {businessRegisterSchema, registerSchema} from "../utils/validators";
import {UserModel} from "../models/user";
import {BUserModel} from "../models/businessUser.model";
import HttpException from "../exceptions/HttpException";
import {generateJWT, generateBusinessJWT} from "../utils/jwt";

class AuthService {

    public requireLocalAuth = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (err: Error | null, user: any, info: any) => {
            // console.log(err, user)
            if (err) {
                return next(err);
            }
            // console.log(info)
            if (!user) {
                return res.status(422).send(info);
            }
            req.user = user;
            next();
        })(req, res, next);
    };

    public requireBusinessAuth = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('business-local', (err: Error | null, user: any, info: any) => {
            // console.log(err, user)
            if (err) {
                return next(err);
            }
            // console.log(info)
            if (!user) {
                return res.status(422).send(info);
            }
            req.user = user;
            next();
        })(req, res, next);
    }

    public afterLocalLogin = (req: Request, res: Response) => {
        try {
            const token = generateJWT(req.user);
            const me = req.user!;
            res.json({token, me});
        } catch (err) {
            throw new HttpException(401, "Authentication Failed")
        }
    };

    public afterBusinessLogin = (req: Request, res: Response) => {
        try {
            const token = generateBusinessJWT(req.user);
            const me = req.user!;
            res.json({token, me});
        } catch (err) {
            throw new HttpException(401, "Authentication Failed")
        }
    };

    public after3rdLogin = (req: Request, res: Response) => {
        try {
            console.log("After 3rd login")
            const token = generateJWT(req.user);
            res.header('Authentication', "Bearer " + token);
            // res.cookie('x-auth-cookie', token);
            // res.redirect('/'); // todo: verify this
            res.send({
                token,
                "me": req.user
            })
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

                newUser.registerUser(newUser, (user: any) => {
                    if (!user) throw new HttpException(500, "Register failed.");
                    res.json({ message: 'Register success.' }); // just redirect to login
                });
            } catch (err) {
                return next(err);
            }
        } catch (err) {
            return next(err);
        }
    }

    public addBusinessUser = async (req: Request, res: Response, next: NextFunction) => {
        const { error } = businessRegisterSchema.validate(req.body)

        if (error) {
            return res.status(442).send({ message: error.details[0].message });
        }

        const { identifier, password, description } = req.body;
        try {
            const existingUser = await BUserModel.findOne({ identifier });
            if (existingUser) {
                return res.status(422).send({ message: `Identifier [${identifier}] is in use` });
            }

            try {
                const newUser = new BUserModel({
                    identifier,
                    password,
                    description,
                });

                newUser.createBUser(newUser);
                res.json({ message: 'Register success.' });
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

    public requireAuth = (req: Request, res: Response, next: NextFunction) => {
        // corresponding with the {jwtLogin} strategy
        // The way to provide this auth is to have a
        // Bearer token in the Authorization header
        passport.authenticate("jwt", (err: Error | null, user: any) => {
            console.log("Authenticating with jwt...")
            if (err) {
                // console.log(err)
                return res.status(401).json({ error: 'unauthorized', message: err.message })
            }
            if (!user) {
                return res.status(401).json({ error: 'unauthorized', message: 'Need to set Authorization Header' })
            } else {
                return next()
            }
        })(req, res, next);
    }

    public requireBusinessJwtAuth = (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate("business-jwt", (err: Error | null, user: any) => {
            // console.log("Authenticating with jwt...")
            if (err) {
                // console.log(err)
                return res.status(401).json({ error: 'unauthorized', message: err.message })
            }
            if (!user) {
                return res.status(401).json({ error: 'unauthorized', message: 'Need to set Authorization Header' })
            } else {
                return next()
            }
        })(req, res, next);
    }

    public requireBusinessAdmin = (req: any, res: Response, next: NextFunction) => {
        if (req.user && req.user.identifier === "admin") {
            console.log(req.user)
            // console.log("Checking admin...")
            next()
        } else {
            console.log(req.dir)
            res.status(401).json({ error: 'unauthorized', message: 'Not Admin' })
        }
    }

}

export default AuthService