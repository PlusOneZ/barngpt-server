import { Request, Response, NextFunction } from "express";
import {TaskService} from "../services/task.service";
import {CreateTaskDto} from "../dtos/task.dto";
import {Task} from "../models/task.model";

class TaskHandler {
    taskService = new TaskService();

    public newTask = async (req: Request, res: Response, next: NextFunction) => {
        const taskData = new CreateTaskDto(req.body.content);
        try {
            const t: Task = await this.taskService.createTask(taskData);
            // todo use projection as return
            res.json( { data: t, message: "Task created" });
        } catch (e) {
            next(e)
        }
    }

    public getSome = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tasks = await this.taskService.findSomeTasks(10);
            res.json(tasks);
        } catch (e) {
            next(e)
        }
    }

    public getNewest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const theTask = await this.taskService.getNewestOne();
            res.json(theTask);
        } catch (e) {
            next(e)
        }
    }

}

export default TaskHandler