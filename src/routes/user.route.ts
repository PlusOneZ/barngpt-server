import { Router } from "express";
import Route from "../interfaces/Route.interface";
import AuthService from "../services/auth.service";
import BusinessUserHandler from "../controllers/businessUser.handler";

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class BusinessUserRoute implements Route {
    public path = `${process.env.API_PREFIX || ''}/buser`;
    public router = Router();
    public businessUserHandler = new BusinessUserHandler();
    public authHandler = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const routes = Router();

        // Admin can check all users and add
        routes.get(
            '/admin/all/users',
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.getSomeUsers
        )
        routes.get(
            '/admin/:identifier',
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.getUserByIdentifier
        );
        routes.post(
            '/admin/add',
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.authHandler.addBusinessUser
        );
        routes.put("/admin/change/currency",
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.changeCurrency
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
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.getMyCreditsHistory
        )

        // Mod credit, should be admin
        routes.put(
            "/admin/add/credits",
            this.authHandler.requireBusinessJwtAuth,
            this.authHandler.requireBusinessAdmin,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.addCredits
        )

        // Mod own info
        routes.put(
            "/toggle/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.checkIpOption
        )
        routes.post(
            "/add/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.businessUserHandler.addIpToWhiteList
        )

        // Check IP
        routes.get(
            "/check/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.currentIpAddress
        )
        routes.get(
            "/test/ip",
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.requireBusinessUserIpCheck,
            (req: any, res: any) => {
                res.send({ message: 'You are authenticated' })
            }
        )

        this.router.use(this.path, routes);
    }
}

export default BusinessUserRoute;
