"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const logging_1 = require("../utils/logging");
class AuthRoute {
    constructor() {
        this.path = '/auth';
        this.router = (0, express_1.Router)();
        this.authHandler = new auth_service_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Local
        const routes = (0, express_1.Router)();
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
        routes.post('/business/login', this.authHandler.requireBusinessAuth, this.authHandler.afterBusinessLogin);
        routes.put('/business/user/credits', this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin);
        // test jwt
        routes.get('/test/jwt', this.authHandler.requireAuth, (req, res) => {
            res.send({ message: 'You are authenticated' });
        });
        routes.get("/business/test/admin", this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, (req, res) => {
            logging_1.log.info(req.user);
            res.send({ message: 'You are an admin' });
        });
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
        this.router.use(this.path, routes);
    }
}
exports.default = AuthRoute;
//# sourceMappingURL=auth.route.js.map