import { Request, Response, NextFunction } from "express";
import TaskService from "../services/task.service";
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
            let tasks : any[] = await this.taskService.findSomeTasks(10);
            tasks = tasks.map( (t) => {
                // TODO: better ways
                return {
                    _id: t._id.toString(),
                    content: t.content,
                    status: t.status,
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    results: t.results
                }
            })
            // console.log(tasks)
            res.status(200).json({data: tasks, message: "OK"});
        } catch (e) {
            next(e)
        }
    }

    public getNewest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const theTask = await this.taskService.getNewestOne();
            res.status(200).json({data: theTask, message: "OK"});
        } catch (e) {
            next(e)
        }
    }

    public getResults = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const r = await this.taskService.getResults(req.params.id);
            res.json({data: r, message: r.length ? "OK" : "Task not done yet"});
        } catch (e) {
            next(e)
        }
    }

}

export default TaskHandler