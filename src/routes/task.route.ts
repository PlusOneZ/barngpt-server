import { Router } from "express"
import TaskHandler from "../controllers/task.handler";
import Route from "../interfaces/Route.interface";
import AuthService from "../services/auth.service";

class TaskRoute implements Route {
    public path = '/task'
    public router = Router();
    public taskHandler = new TaskHandler();
    public authHandler = new AuthService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const routes = Router();

        this.router.post(`${this.path}`, this.taskHandler.newTask);
        this.router.get(`${this.path}`, this.taskHandler.getNewest);

        routes.get(`/some`, this.taskHandler.getSome);
        routes.get(`/:id/results`, this.taskHandler.getResults);
        routes.put(`/:taskId/hook`, this.taskHandler.hookResults);
        routes.get(`/:id`, this.taskHandler.getTaskById);

        // Authenticated routes
        routes.post(
            `/withAuth`,
            this.authHandler.requireBusinessJwtAuth,
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