import { TaskModel, Task } from "../models/task.model";
import HttpException from "../exceptions/HttpException";
import {CreateTaskDto} from "../dtos/task.dto";
import FileService from "./file.service";

class TaskService {
    public tasks = TaskModel;
    fileService = new FileService();

    public async createTask(taskData: CreateTaskDto) : Promise<Task> {
        const t = await this.tasks.create( taskData )
        if (!t) {
            console.error(`Error while saving Task(with ${taskData.content})`)
            throw new HttpException(500, "Task Create Failed.")
        }
        let changeFlag = false;
        if (t.taskType === "image-recognition") {
            t.content.prompts[0].content = t.content.prompts[0].content.map((c: any) => {
                if (c.type === "image_url" && c.image_url.url.startsWith("data:image/")) {
                    c.image_url.url =
                        this.fileService.base64ImageToFile(
                            c.image_url.url,
                            t._id.toString()
                        );
                    if (!c.image_url.url) {
                        this.tasks.deleteOne({_id: t._id}).exec();
                        throw new HttpException(
                            400,
                            "Invalid base64 image MIME type should be one of " +
                            "png|jpeg|jpg|gif|webp|svg. Starting with data:image/"
                        )
                    }
                    changeFlag = true;
                }
                return c;
            })
        }
        if (changeFlag) { await this.tasks.updateOne({_id: t._id}, t).exec(); }
        return t;
    }

    public async findSomeTasks(count: number) {
        if (count <= 0) return [];
        return await this.tasks.find(
            {},
            null,
            {limit: count}
        ).sort({ updatedAt: "desc" }).exec();
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