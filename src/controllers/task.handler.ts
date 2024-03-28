import { Request, Response, NextFunction } from "express";
import {TaskService} from "../services/task.service";
import {CreateTaskDto} from "../dtos/task.dto";
import {Task} from "../models/task.model";

export class TaskHandler {
    taskService = new TaskService();

    public newTask = async (req: Request, res: Response, next: NextFunction) => {
        const taskData: CreateTaskDto = req.body;
        try {
            const t: Task = await this.taskService.createTask(taskData);
            res.status(201).json( { data: t, message: "Task created" })
        } catch (e) {
            next(e)
        }
    }
}