import { TaskModel, Task } from "../models/task.model";
import {CreateTaskDto} from "../dtos/task.dto";
import HttpException from "../exceptions/HttpException";
import FileService from "./file.service";

import { log } from "../utils/logging";

class TaskService {
    public tasks = TaskModel;
    fileService = new FileService();

    public async createTask(taskData: CreateTaskDto) : Promise<Task> {
        const t = await this.tasks.create( taskData )
        if (!t) {
            log.error(`Error while saving Task(with ${taskData.content})`)
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
        const ret = await this.tasks.findOne({_id: t._id}).populate("ownerId").exec();
        return ret!;
    }

    public async findSomeTasks(count: number, userId: string | undefined) {
        if (count <= 0) return [];
        return await this.tasks.find(
            { "ownerId": userId },
            null,
            {limit: count}
        )
            .populate("ownerId")
            .sort({ updatedAt: "desc" }).exec();
    }

    public async getNewestOne(userId: string | undefined) {
        return await this.tasks.findOne({ "ownerId": userId })
            .sort({ createdAt: "desc" })
            .populate("ownerId").exec();
    }

    public async getResults(taskId: string, userId: string | undefined) {
        const t = await this.tasks.findOne(
            {_id: taskId, ownerId: userId}
        ).exec();
        if (!t) {
            throw new HttpException(404, "Task not found.");
        } else if (t.status !== "done") {
            return [];
        }
        return t.results;
    }

    public async getTaskById(taskId: string, userId: string | undefined) {
        try {
            return this.tasks.findOne({_id: taskId, ownerId: userId})
                .populate("ownerId")
                .exec();
        } catch (e) {
            throw new HttpException(500, "Parsing task UUID failed.");
        }
    }

}

export default TaskService;