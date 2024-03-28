import { TaskModel, Task } from "../models/task.model";
import HttpException from "../exceptions/HttpException";
import {CreateTaskDto} from "../dtos/task.dto";

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


}