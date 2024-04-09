"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_service_1 = __importDefault(require("../services/task.service"));
const task_dto_1 = require("../dtos/task.dto");
const thirdPartyAgent_service_1 = __importDefault(require("../services/thirdPartyAgent.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class TaskHandler {
    constructor() {
        this.taskService = new task_service_1.default();
        this.agentService = new thirdPartyAgent_service_1.default();
        this.newTask = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const taskData = new task_dto_1.CreateTaskDto(req.body.content);
            try {
                const t = yield this.taskService.createTask(taskData);
                res.status(201).json({ data: TaskHandler.taskStringify(t), message: "Task created" });
                this.agentService.sendChatReq(this.agentService.createHook(t._id.toString()), { content: taskData.content }).then(() => console.log("Hook sent")).catch((e) => console.error(`Error while sending hook: ${e}`));
            }
            catch (e) {
                next(e);
            }
        });
        this.getSome = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield this.taskService.findSomeTasks(10);
                tasks = tasks.map(TaskHandler.taskStringify);
                // console.log(tasks)
                res.status(200).json({ data: tasks, message: "OK" });
            }
            catch (e) {
                next(e);
            }
        });
        this.getNewest = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const theTask = yield this.taskService.getNewestOne();
                res.status(200).json({ data: TaskHandler.taskStringify(theTask), message: "OK" });
            }
            catch (e) {
                next(e);
            }
        });
        this.getResults = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const r = yield this.taskService.getResults(req.params.id);
                res.json({ data: r, message: r.length ? "OK" : "Task not done yet" });
            }
            catch (e) {
                next(e);
            }
        });
        this.hookResults = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { taskId } = req.params;
                const taskData = req.body;
                console.log(`Task ${taskId} hook called with ${taskData}`);
                yield this.agentService.taskUpdate(taskId, taskData);
                res.status(201).json({ message: "Task updated" });
            }
            catch (e) {
                next(e);
            }
        });
        this.getTaskById = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const t = yield this.taskService.getTaskById(req.params.id);
                if (!t) {
                    throw new HttpException_1.default(404, "Task not found.");
                }
                res.json({ data: TaskHandler.taskStringify(t), message: "OK" });
            }
            catch (e) {
                next(e);
            }
        });
    }
    static taskStringify(t) {
        return {
            _id: t._id.toString(),
            content: t.content,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            results: t.results
        };
    }
}
exports.default = TaskHandler;
