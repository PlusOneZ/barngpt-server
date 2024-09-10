"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_model_1 = require("../models/task.model");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const file_service_1 = __importDefault(require("./file.service"));
const logging_1 = require("../utils/logging");
class TaskService {
    constructor() {
        this.tasks = task_model_1.TaskModel;
        this.fileService = new file_service_1.default();
    }
    async createTask(taskData) {
        const t = await this.tasks.create(taskData);
        if (!t) {
            logging_1.log.error(`Error while saving Task(with ${taskData.content})`);
            throw new HttpException_1.default(500, "Task Create Failed.");
        }
        let changeFlag = false;
        if (t.taskType === "image-recognition") {
            t.content.prompts[0].content = t.content.prompts[0].content.map((c) => {
                if (c.type === "image_url" && c.image_url.url.startsWith("data:image/")) {
                    c.image_url.url =
                        this.fileService.base64ImageToFile(c.image_url.url, t._id.toString());
                    if (!c.image_url.url) {
                        this.tasks.deleteOne({ _id: t._id }).exec();
                        throw new HttpException_1.default(400, "Invalid base64 image MIME type should be one of " +
                            "png|jpeg|jpg|gif|webp|svg. Starting with data:image/");
                    }
                    changeFlag = true;
                }
                return c;
            });
        }
        if (changeFlag) {
            await this.tasks.updateOne({ _id: t._id }, t).exec();
        }
        const ret = await this.tasks.findOne({ _id: t._id }).populate("ownerId").exec();
        return ret;
    }
    async findSomeTasks(count, userId) {
        if (count <= 0)
            return [];
        return await this.tasks.find({ "ownerId": userId }, null, { limit: count })
            .populate("ownerId")
            .sort({ updatedAt: "desc" }).exec();
    }
    async getNewestOne(userId) {
        return await this.tasks.findOne({ "ownerId": userId })
            .sort({ createdAt: "desc" })
            .populate("ownerId").exec();
    }
    async getResults(taskId, userId) {
        const t = await this.tasks.findOne({ _id: taskId, ownerId: userId }).exec();
        if (!t) {
            throw new HttpException_1.default(404, "Task not found.");
        }
        else if (t.status !== "done") {
            return [];
        }
        return t.results;
    }
    async getTaskById(taskId, userId) {
        try {
            return this.tasks.findOne({ _id: taskId, ownerId: userId })
                .populate("ownerId")
                .exec();
        }
        catch (e) {
            throw new HttpException_1.default(500, "Parsing task UUID failed.");
        }
    }
}
exports.default = TaskService;
//# sourceMappingURL=task.service.js.map