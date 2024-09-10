"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thirdPartyAgent_service_1 = __importDefault(require("../services/thirdPartyAgent.service"));
const task_model_1 = require("../models/task.model");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../utils/db");
describe("ThirdPartyAgentService", () => {
    let thirdPartyAgentService;
    beforeAll(() => {
        dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
        thirdPartyAgentService = new thirdPartyAgent_service_1.default();
        db_1.db.collection('app_test_users');
    });
    it("should create a hook", () => {
        const taskId = "123";
        const hook = thirdPartyAgentService.createHook(taskId);
        expect(hook).toEqual("http://localhost:3000/task/123/hook");
    });
    it("should update task status", async () => {
        const task = await task_model_1.TaskModel.findOne({ _id: "b697f801-0fae-4367-95bd-0902ea587968" }).exec();
        console.log(task);
        const taskData = {
            results: ["this is a result", "this is another result"],
        };
        await thirdPartyAgentService.taskUpdate(task === null || task === void 0 ? void 0 : task._id.toString(), taskData);
    });
});
//# sourceMappingURL=agent.test.js.map