"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_handler_1 = __importDefault(require("../controllers/task.handler"));
class TaskRoute {
    constructor() {
        this.path = '/task';
        this.router = (0, express_1.Router)();
        this.taskHandler = new task_handler_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}`, this.taskHandler.newTask);
        this.router.get(`${this.path}/some`, this.taskHandler.getSome);
        this.router.get(`${this.path}`, this.taskHandler.getNewest);
        this.router.get(`${this.path}/:id/results`, this.taskHandler.getResults);
        this.router.put(`${this.path}/:taskId/hook`, this.taskHandler.hookResults);
        this.router.get(`${this.path}/:id`, this.taskHandler.getTaskById);
    }
}
exports.default = TaskRoute;
