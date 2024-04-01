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
const task_model_1 = require("../models/task.model");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class TaskService {
    constructor() {
        this.tasks = task_model_1.TaskModel;
    }
    createTask(taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const t = this.tasks.create(taskData);
            if (!t) {
                console.error(`Error while saving Task(with ${taskData.content})`);
                throw new HttpException_1.default(500, "Task Create Failed.");
            }
            return t;
        });
    }
    findSomeTasks(count) {
        return __awaiter(this, void 0, void 0, function* () {
            if (count <= 0)
                return [];
            return yield this.tasks.find({}, null, { limit: count }).exec();
        });
    }
    getNewestOne() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.tasks.findOne({}).sort({ createdAt: "desc" }).exec();
        });
    }
    getResults(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const t = yield this.tasks.findOne({ _id: taskId }).exec();
                if (!t) {
                    throw new HttpException_1.default(404, "Task not found.");
                }
                else if (t.status !== "done") {
                    return [];
                }
                return t.results;
            }
            catch (e) {
                throw new HttpException_1.default(500, "Parsing task UUID failed.");
            }
        });
    }
    getTaskById(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.tasks.findOne({ _id: taskId }).exec();
            }
            catch (e) {
                throw new HttpException_1.default(500, "Parsing task UUID failed.");
            }
        });
    }
}
exports.default = TaskService;
