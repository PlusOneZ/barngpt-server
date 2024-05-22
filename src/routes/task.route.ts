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
        this.router.post(`${this.path}`, this.taskHandler.newTask);
        this.router.post(
            `${this.path}/withAuth`,
            this.authHandler.requireAuth,
            this.taskHandler.newTaskWithAuth
        )
        this.router.get(`${this.path}/some`, this.taskHandler.getSome);
        this.router.get(`${this.path}`, this.taskHandler.getNewest);
        this.router.get(`${this.path}/:id/results`, this.taskHandler.getResults);
        this.router.put(`${this.path}/:taskId/hook`, this.taskHandler.hookResults);
        this.router.get(`${this.path}/:id`, this.taskHandler.getTaskById);
    }
}

export default TaskRoute;