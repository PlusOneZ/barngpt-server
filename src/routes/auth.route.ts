import { Router } from "express";
import AuthService from "../services/auth.service";
import Route from "../interfaces/Route.interface";

import { log } from "../utils/logging";

class AuthRoute implements Route {
    public path = '/auth';
    public router = Router();
    public authHandler = new AuthService();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        // Local
        const routes = Router()
        // routes.post(
        //     '/login',
        //     this.authHandler.requireLocalAuth,
        //     this.authHandler.afterLocalLogin
        // );
        // routes.post(
        //     '/register',
        //     this.authHandler.localRegister
        // )
        // routes.get(
        //     '/logout',
        //     this.authHandler.logout
        // )

        // Business Local
        routes.post(
            '/business/login',
            this.authHandler.requireBusinessAuth,
            this.authHandler.afterBusinessLogin
        );

        routes.put(
            '/business/user/credits',
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
        )

        // test jwt
        routes.get(
            '/test/jwt',
            this.authHandler.requireAuth,
            (req: any, res: any) => {
                res.send({ message: 'You are authenticated' })
            }
        )
        routes.get(
            "/business/test/admin",
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            (req: any, res: any) => {
                log.info(req.user)
                res.send({message: 'You are an admin'})
            }
        )

        // Google
        // routes.get(
        //     '/google',
        //     passport.authenticate('google', {
        //         scope: ['profile', 'email'],
        //         session: false,
        //     })
        // )
        // routes.get(
        //     '/google/callback',
        //     passport.authenticate('google', {
        //         failureRedirect: '/',
        //         failureFlash: true,
        //         session: false,
        //     }),
        //     this.authHandler.after3rdLogin
        // )

        // Facebook
        // routes.get(
        //     '/facebook',
        //     passport.authenticate('facebook', {
        //         scope: ['public_profile', 'email'],
        //     }),
        // )
        // routes.get(
        //     '/facebook/callback',
        //     passport.authenticate('facebook', {
        //         failureRedirect: '/',
        //         session: false,
        //     }),
        //     this.authHandler.after3rdLogin
        // )

        this.router.use(this.path, routes)
    }
}

export default AuthRoute