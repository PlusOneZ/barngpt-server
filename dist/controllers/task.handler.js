"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_dto_1 = require("../dtos/task.dto");
const task_service_1 = __importDefault(require("../services/task.service"));
const thirdPartyAgent_service_1 = __importDefault(require("../services/thirdPartyAgent.service"));
const businessUser_service_1 = __importDefault(require("../services/businessUser.service"));
const validators_1 = require("../utils/validators");
const constants_1 = require("../utils/constants");
const logging_1 = require("../utils/logging");
class TaskHandler {
    constructor() {
        this.taskService = new task_service_1.default();
        this.agentService = new thirdPartyAgent_service_1.default();
        this.businessUserService = new businessUser_service_1.default();
        this.newTask = async (req, res, next) => {
            try {
                let data = req.body;
                data.taskType = task_dto_1.CreateTaskDto.convertTaskType(data.taskType);
                const { error } = (0, validators_1.validateTask)(data);
                if (error) {
                    res.status(442).json({ status: "Failed", message: error.message });
                    return;
                }
                const taskData = task_dto_1.CreateTaskDto.fromJson(data);
                if (req.user) {
                    taskData.setOwner(req.user.id);
                }
                const t = await this.taskService.createTask(taskData);
                res.status(201).json({ data: TaskHandler.taskStringify(t), message: "Task created" });
                this.agentService.doTask(t).then(() => logging_1.log.info("Hook sent")).catch((e) => logging_1.log.error(`Error while sending hook: ${e}`)
                // announce failure to task results.
                );
            }
            catch (e) {
                next(e);
            }
        };
        this.newTaskWithAuth = async (req, res, next) => {
            if (!req.user) {
                res.status(401).json({ error: "No Auth", message: "Set a valid Authentication Header with Bearer token" });
                return;
            }
            else if (validators_1.businessJwtPayloadSchema.validate(req.user).error) {
                res.status(401).json({ error: "Invalid Auth", message: "Dirty token, try login bUser again." });
                return;
            }
            // log.info(req.user)
            const bUserDoc = await this.businessUserService.getBusinessUserByObjId(req.user.id);
            if (!bUserDoc) {
                res.status(401).json({ error: "Invalid Auth", message: "User not found in database." });
                return;
            }
            if (bUserDoc.credits < constants_1.MINIMUM_TASKABLE_CREDITS) {
                logging_1.log.warn(`Credits not enough for user: ${bUserDoc.identifier}.`);
                res.status(403).json({ error: "Insufficient Credits", message: "Top up your credits to create a task." });
                return;
            }
            return this.newTask(req, res, next);
        };
        this.getSome = async (req, res, next) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                let tasks = await this.taskService.findSomeTasks(10, userId);
                tasks = tasks.map(TaskHandler.taskStringify);
                // log.debug(tasks)
                res.status(200).json({ data: tasks, message: "OK" });
            }
            catch (e) {
                next(e);
            }
        };
        this.getNewest = async (req, res, next) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                logging_1.log.debug(`User ${userId} is querying for newest task`);
                const theTask = await this.taskService.getNewestOne(userId);
                if (!theTask) {
                    return res.status(404).json({ message: "Task not found" });
                }
                res.status(200).json({ data: TaskHandler.taskStringify(theTask), message: "OK" });
            }
            catch (e) {
                next(e);
            }
        };
        this.getResults = async (req, res, next) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const r = await this.taskService.getResults(req.params.id, userId);
                res.json({ data: r, message: r.length ? "OK" : "Task not done yet" });
            }
            catch (e) {
                next(e);
            }
        };
        this.hookResults = async (req, res, next) => {
            try {
                const { taskId } = req.params;
                const taskData = req.body;
                logging_1.log.info(`Task ${taskId} hook called with ${taskData}`);
                await this.agentService.taskUpdate(taskId, taskData);
                res.status(201).json({ message: "Task updated" });
            }
            catch (e) {
                next(e);
            }
        };
        this.getTaskById = async (req, res, next) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const t = await this.taskService.getTaskById(req.params.id, userId);
                if (!t) {
                    return res.status(404).json({ message: "Task not found" });
                }
                res.json({ data: TaskHandler.taskStringify(t), message: "OK" });
            }
            catch (e) {
                res.status(400).json({ message: e.message });
            }
        };
        this.getPrices = async (req, res, next) => {
            try {
                const bUserDoc = await this.businessUserService.getBusinessUserByObjId(req.user.id);
                const currency = bUserDoc === null || bUserDoc === void 0 ? void 0 : bUserDoc.currency;
                const prices = this.agentService.getAllModelPrices(currency ? currency : 10.0);
                res.json({ data: prices, message: "OK" });
            }
            catch (e) {
                next(e);
            }
        };
        this.getModels = async (req, res, next) => {
            try {
                const models = this.agentService.getAllModels();
                res.json({ data: models, message: "OK" });
            }
            catch (e) {
                next(e);
            }
        };
    }
    /**
     * The UUID of mongodb instance is a Buffer, use this method to stringify the UUID field
     * @param t task instance
     * @private
     */
    static taskStringify(t) {
        var _a;
        return {
            _id: t._id.toString(), // UUID to string
            content: t.content,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            results: t.results,
            taskType: t.taskType,
            model: t.model,
            owner: (_a = t.ownerId) === null || _a === void 0 ? void 0 : _a.identifier,
            options: t.options
        };
    }
}
exports.default = TaskHandler;
//# sourceMappingURL=task.handler.js.map