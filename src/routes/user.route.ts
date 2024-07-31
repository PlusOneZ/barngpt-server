import { Router } from "express";
import Route from "../interfaces/Route.interface";
import AuthService from "../services/auth.service";
import BusinessUserHandler from "../controllers/businessUser.handler";

class BusinessUserRoute implements Route {
    public path = '/buser';
    public router = Router();
    public businessUserHandler = new BusinessUserHandler();
    public authHandler = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const routes = Router();

        // Admin can check all users
        routes.get(
            '/admin/:identifier',
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.getUserByIdentifier
        );

        // My own Info
        routes.get(
            "/me",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.getMe
        )
        routes.get(
            "/credits",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.getMyCredits
        )
        routes.get(
            "/credits/history",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.getMyCreditsHistory
        )

        // Mod credit, should be admin
        routes.put(
            "/admin/add/credits",
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.addCredits
        )

        // Mod own info
        routes.put(
            "/toggle/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.checkIpOption
        )
        routes.post(
            "/add/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.addIpToWhiteList
        )

        // Check IP
        routes.get(
            "/check/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.currentIpAddress
        )

        this.router.use(this.path, routes);
    }
}

export default BusinessUserRoute;