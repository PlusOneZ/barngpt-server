import { Request, Response, NextFunction } from "express";
import { CreateTaskDto } from "../dtos/task.dto";
import { Task } from "../models/task.model";
import TaskService from "../services/task.service";
import ThirdPartyAgentService from "../services/thirdPartyAgent.service";
import BusinessUserService from "../services/businessUser.service";
import HttpException from "../exceptions/HttpException";
import {businessJwtPayloadSchema, validateTask} from "../utils/validators";
import businessUserService from "../services/businessUser.service";
import {MINIMUM_TASKABLE_CREDITS} from "../utils/constants";

class TaskHandler {
    taskService = new TaskService();
    agentService = new ThirdPartyAgentService();
    businessUserService = new BusinessUserService();

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
            taskType: t.taskType,
            model: t.model,
            owner: t.ownerId?.identifier
        }
    }

    public newTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let data = req.body;
            data.taskType = CreateTaskDto.convertTaskType(data.taskType);
            const {error} = validateTask(data);
            if (error) {
                res.status(442).json({status: "Failed", message: error.message});
                return;
            }
            const taskData = CreateTaskDto.fromJson(data);
            if (req.user) {
                taskData.setOwner((req.user as any).id);
            }
            const t: Task = await this.taskService.createTask(taskData);
            res.status(201).json( { data: TaskHandler.taskStringify(t), message: "Task created" });
            this.agentService.doTask(t).then(
                () => console.log("Hook sent")
            ).catch(
                (e) => console.error(`Error while sending hook: ${e}`)
                // announce failure to task results.
            );
        } catch (e) {
            next(e)
        }
    }

    public newTaskWithAuth = async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({error: "No Auth", message: "Set a valid Authentication Header with Bearer token"})
            return
        } else if (businessJwtPayloadSchema.validate(req.user).error) {
            res.status(401).json({error: "Invalid Auth", message: "Dirty token, try login bUser again."})
            return
        }
        // console.log(req.user)
        const bUserDoc = await this.businessUserService.getBusinessUserByObjId((req.user as any).id);
        if (!bUserDoc) {
            res.status(401).json({error: "Invalid Auth", message: "User not found in database."})
            return
        }
        if (bUserDoc.credits < MINIMUM_TASKABLE_CREDITS) {
            res.status(403).json({error: "Insufficient Credits", message: "Top up your credits to create a task."})
            return
        }
        return this.newTask(req, res, next);
    }

    public getSome = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.user as any)?.id;
            let tasks : any[] = await this.taskService.findSomeTasks(10, userId);
            tasks = tasks.map( TaskHandler.taskStringify );
            // console.log(tasks)
            res.status(200).json({data: tasks, message: "OK"});
        } catch (e) {
            next(e)
        }
    }

    public getNewest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.user as any)?.id;
            console.log(`User ${userId} is querying for newest task`)
            const theTask = await this.taskService.getNewestOne(userId);
            if (!theTask) {
                return res.status(404).json({message: "Task not found"});
            }
            res.status(200).json({data: TaskHandler.taskStringify(theTask), message: "OK"});
        } catch (e) {
            next(e)
        }
    }

    public getResults = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req.user as any)?.id;
            const r = await this.taskService.getResults(req.params.id, userId);
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
            const userId = (req.user as any)?.id;
            const t = await this.taskService.getTaskById(req.params.id, userId);
            if (!t) {
                return res.status(404).json({message: "Task not found"});
            }
            res.json({data: TaskHandler.taskStringify(t), message: "OK"});
        } catch (e) {
            res.status(400).json({message: (e as any).message});
        }
    }
}

export default TaskHandler