import { Router } from "express"
import TaskHandler from "../controllers/task.handler";
import Route from "../interfaces/Route.interface";
import AuthService from "../services/auth.service";
import BusinessUserHandler from "../controllers/businessUser.handler";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class TaskRoute implements Route {
    public path = `${process.env.API_PREFIX || ''}/task`
    public router = Router();
    public taskHandler = new TaskHandler();
    public authHandler = new AuthService();
    public businessUserHandler = new BusinessUserHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const routes = Router();

        this.router.post(
            `${this.path}`,
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.taskHandler.newTaskWithAuth
        );
        this.router.get(
            `${this.path}`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getNewest
        );

        routes.get(
            `/some`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getSome
        );
        routes.get(
            `/:id/results`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getResults
        );
        // routes.get(
        //     `/models/prices`,
        //     this.authHandler.requireBusinessJwtAuth,
        //     this.taskHandler.getPrices
        // );
        routes.get(
            `/models`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getModels
        );

        // TODO: Add security methods
        routes.put(
            `/:taskId/hook`,
            this.taskHandler.hookResults
        );

        routes.get(
            `/:id`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getTaskById
        );

        // Authenticated routes
        routes.post(
            `/withAuth`,
            this.authHandler.requireBusinessJwtAuth,
            this.businessUserHandler.requireBusinessUserIpCheck,
            this.taskHandler.newTaskWithAuth
        )
        routes.get(
            `/latest/withAuth`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getNewest
        )
        routes.get(
            `/some/withAuth`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getSome
        )
        routes.get(
            `/withAuth/results/:id`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getResults
        )
        routes.get(
            `/withAuth/:id`,
            this.authHandler.requireBusinessJwtAuth,
            this.taskHandler.getTaskById
        )

        this.router.use(this.path, routes);
    }
}

export default TaskRoute;
