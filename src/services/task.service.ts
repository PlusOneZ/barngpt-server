import { TaskModel, Task } from "../models/task.model";
import HttpException from "../exceptions/HttpException";
import {CreateTaskDto} from "../dtos/task.dto";

class TaskService {
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

    public async getResults(taskId: string) {
        try {
            const t = await this.tasks.findOne({_id: taskId}).exec();
            if (!t) {
                throw new HttpException(404, "Task not found.");
            } else if (t.status !== "done") {
                return [];
            }
            return t.results;
        } catch (e) {
            throw new HttpException(500, "Parsing task UUID failed.");
        }
    }

    public async getTaskById(taskId: string) {
        try {
            return this.tasks.findOne({_id: taskId}).exec();
        } catch (e) {
            throw new HttpException(500, "Parsing task UUID failed.");
        }
    }

}

export default TaskService;