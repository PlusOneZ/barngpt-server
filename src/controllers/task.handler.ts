import { Request, Response, NextFunction } from "express";
import {CreateTaskDto} from "../dtos/task.dto";
import {Task} from "../models/task.model";
import TaskService from "../services/task.service";
import ThirdPartyAgentService from "../services/thirdPartyAgent.service";
import HttpException from "../exceptions/HttpException";
import {taskSchema} from "../utils/validators";

class TaskHandler {
    taskService = new TaskService();
    agentService = new ThirdPartyAgentService();

    /**
     * The UUID of mongodb instance is a Buffer, use this method to stringify the UUID field
     * @param t task instance
     * @private
     */
    private static taskStringify(t: any) {
        return {
            _id: t._id.toString(),  // UUID to string
            content: t.content,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            results: t.results,
            taskType: t.taskType
        }
    }

    public newTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let data = req.body;
            data.taskType = CreateTaskDto.convertTaskType(data.taskType);
            const {error} = taskSchema.validate(data);
            if (error) {
                res.status(400).json({status: "Failed", message: error.message});
                return;
            }
            const taskData = CreateTaskDto.fromJson(req.body);
            const t: Task = await this.taskService.createTask(taskData);
            res.status(201).json( { data: TaskHandler.taskStringify(t), message: "Task created" });
            this.agentService.doTask(t).then(
                () => console.log("Hook sent")
            ).catch(
                (e) => console.error(`Error while sending hook: ${e}`)
            );
        } catch (e) {
            next(e)
        }
    }

    public newTaskWithAuth = async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.user);
        return this.newTask(req, res, next);
    }

    public getSome = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let tasks : any[] = await this.taskService.findSomeTasks(10);
            tasks = tasks.map( TaskHandler.taskStringify );
            // console.log(tasks)
            res.status(200).json({data: tasks, message: "OK"});
        } catch (e) {
            next(e)
        }
    }

    public getNewest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const theTask = await this.taskService.getNewestOne();
            res.status(200).json({data: TaskHandler.taskStringify(theTask), message: "OK"});
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

    public hookResults = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {taskId} = req.params;
            const taskData = req.body;
            console.log(`Task ${taskId} hook called with ${taskData}`);
            await this.agentService.taskUpdate(taskId, taskData);
            res.status(201).json({message: "Task updated"});
        } catch (e) {
            next(e)
        }
    }

    public getTaskById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = await this.taskService.getTaskById(req.params.id);
            if (!t) {
                throw new HttpException(404, "Task not found.");
            }
            res.json({data: TaskHandler.taskStringify(t), message: "OK"});
        } catch (e) {
            next(e)
        }
    }
}

export default TaskHandler