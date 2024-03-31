import ThirdPartyAgentService from "../services/thirdPartyAgent.service";
import {Task, TaskModel} from "../models/task.model";
import dotenv from "dotenv";
import {db} from "../utils/db";

describe("ThirdPartyAgentService", () => {
    let thirdPartyAgentService: ThirdPartyAgentService;

    beforeAll(() => {
        dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
        thirdPartyAgentService = new ThirdPartyAgentService();
        db.collection('app_test_users');
    })

    it("should create a hook", () => {
        const taskId = "123";
        const hook = thirdPartyAgentService.createHook(taskId);
        expect(hook).toEqual("http://localhost:3000/task/123/hook");
    });

    it("should update task status", async () => {
        const task = await TaskModel.findOne({ _id: "b697f801-0fae-4367-95bd-0902ea587968"}).exec();
        console.log(task);
        const taskData = {
            results: ["this is a result", "this is another result"],
        };
        await thirdPartyAgentService.taskUpdate(task?._id.toString(), taskData);
    });


});