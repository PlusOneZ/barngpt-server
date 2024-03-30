import { TaskModel, Task } from "../models/task.model";
import HttpException from "../exceptions/HttpException";
import {CreateTaskDto} from "../dtos/task.dto";
import mongoose from "mongoose";

export class TaskService {
    public tasks = TaskModel;

    public async createTask(taskData: CreateTaskDto) : Promise<Task> {
        const t = this.tasks.create( taskData )
        if (!t) {
            console.error(`Error while saving Task(with ${taskData.content})`)
            throw new HttpException(500, "Task Create Failed.")
        }
        return t;
    }

    public async findSomeTasks(count: number) {
        if (count <= 0) return [];
        return await this.tasks.find({}, null, {limit: count}).exec();
    }

    public async getNewestOne() {
        return await this.tasks.findOne({}).sort({ createdAt: "desc" }).exec();
    }

}