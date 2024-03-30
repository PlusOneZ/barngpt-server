import { Router } from "express"
import TaskHandler from "../controllers/task.handler";
import Route from "../interfaces/Route.interface";

class TaskRoute implements Route {
    public path = '/task'
    public router = Router();
    public taskHandler = new TaskHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.taskHandler.newTask);
        this.router.get(`${this.path}/some`, this.taskHandler.getSome);
        this.router.get(`${this.path}`, this.taskHandler.getNewest);
    }
}

export default TaskRoute;