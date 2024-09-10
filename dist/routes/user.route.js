"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const businessUser_handler_1 = __importDefault(require("../controllers/businessUser.handler"));
class BusinessUserRoute {
    constructor() {
        this.path = '/buser';
        this.router = (0, express_1.Router)();
        this.businessUserHandler = new businessUser_handler_1.default();
        this.authHandler = new auth_service_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const routes = (0, express_1.Router)();
        // Admin can check all users and add
        routes.get('/admin/all/users', this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.getSomeUsers);
        routes.get('/admin/:identifier', this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.getUserByIdentifier);
        routes.post('/admin/add', this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, this.businessUserHandler.requireBusinessUserIpCheck, this.authHandler.addBusinessUser);
        routes.put("/admin/change/currency", this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.changeCurrency);
        // My own Info
        routes.get("/me", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.getMe);
        routes.get("/credits", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.getMyCredits);
        routes.get("/credits/history", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.getMyCreditsHistory);
        // Mod credit, should be admin
        routes.put("/admin/add/credits", this.authHandler.requireBusinessJwtAuth, this.authHandler.requireBusinessAdmin, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.addCredits);
        // Mod own info
        routes.put("/toggle/ip", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.checkIpOption);
        routes.post("/add/ip", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, this.businessUserHandler.addIpToWhiteList);
        // Check IP
        routes.get("/check/ip", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.currentIpAddress);
        routes.get("/test/ip", this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, (req, res) => {
            res.send({ message: 'You are authenticated' });
        });
        this.router.use(this.path, routes);
    }
}
exports.default = BusinessUserRoute;
//# sourceMappingURL=user.route.js.map