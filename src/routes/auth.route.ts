import { Router } from "express";
import AuthService from "../services/auth.service";
import Route from "../interfaces/Route.interface";
import passport from "passport";

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
        routes.post(
            '/login',
            this.authHandler.requireLocalAuth,
            this.authHandler.afterLocalLogin);
        routes.post(
            '/register',
            this.authHandler.localRegister
        )
        routes.get(
            '/logout',
            this.authHandler.logout
        )

        routes.get(
            '/test/jwt',
            this.authHandler.requireAuth,
            (req: any, res: any) => {
                res.send({ message: 'You are authenticated' })
            }
        )

        // Google
        routes.get(
            '/google',
            passport.authenticate('google', {
                scope: ['profile', 'email'],
                session: false,
            })
        )
        routes.get(
            '/google/callback',
            passport.authenticate('google', {
                failureRedirect: '/',
                failureFlash: true,
            }),
            this.authHandler.after3rdLogin
        )

        // Facebook
        routes.get(
            '/facebook',
            passport.authenticate('facebook', {
                scope: ['public_profile', 'email'],
            }),
        )
        routes.get(
            '/facebook/callback',
            passport.authenticate('facebook', {
                failureRedirect: '/',
                session: false,
            }),
            this.authHandler.after3rdLogin
        )

        this.router.use(this.path, routes)
    }
}

export default AuthRoute