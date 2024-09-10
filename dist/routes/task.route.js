"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_handler_1 = __importDefault(require("../controllers/task.handler"));
const auth_service_1 = __importDefault(require("../services/auth.service"));
const businessUser_handler_1 = __importDefault(require("../controllers/businessUser.handler"));
class TaskRoute {
    constructor() {
        this.path = '/task';
        this.router = (0, express_1.Router)();
        this.taskHandler = new task_handler_1.default();
        this.authHandler = new auth_service_1.default();
        this.businessUserHandler = new businessUser_handler_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        const routes = (0, express_1.Router)();
        this.router.post(`${this.path}`, this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, this.taskHandler.newTaskWithAuth);
        this.router.get(`${this.path}`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getNewest);
        routes.get(`/some`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getSome);
        routes.get(`/:id/results`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getResults);
        // routes.get(
        //     `/models/prices`,
        //     this.authHandler.requireBusinessJwtAuth,
        //     this.taskHandler.getPrices
        // );
        routes.get(`/models`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getModels);
        // TODO: Add security methods
        routes.put(`/:taskId/hook`, this.taskHandler.hookResults);
        routes.get(`/:id`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getTaskById);
        // Authenticated routes
        routes.post(`/withAuth`, this.authHandler.requireBusinessJwtAuth, this.businessUserHandler.requireBusinessUserIpCheck, this.taskHandler.newTaskWithAuth);
        routes.get(`/latest/withAuth`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getNewest);
        routes.get(`/some/withAuth`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getSome);
        routes.get(`/withAuth/results/:id`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getResults);
        routes.get(`/withAuth/:id`, this.authHandler.requireBusinessJwtAuth, this.taskHandler.getTaskById);
        this.router.use(this.path, routes);
    }
}
exports.default = TaskRoute;
//# sourceMappingURL=task.route.js.map