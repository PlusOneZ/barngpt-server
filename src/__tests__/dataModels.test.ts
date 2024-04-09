import dotenv from "dotenv";

import { db } from "../utils/db"
import { UserModel, User } from "../models/user";
import {TaskModel, Task} from "../models/task.model";
import {CreateTaskDto} from "../dtos/task.dto";
import exp from "constants";

describe("User Model Test", () => {
    beforeAll(() => {
        dotenv.config({ path: `.env.${process.env.NODE_ENV}`});
    })

    it("User Type", () => {
        const u = new UserModel({name: "test user", email: "qwe@123.com"});

        expect(u.name).toBe("test user")
    })

    it("User storage", async () => {
        db.collection('app_test_users');
        const u = new UserModel({
            name: "test user",
            email: "qwe@123.com",
        });
        await u.save()
        const userId = u._id

        UserModel.findOne( { _id: u._id })
            .populate< { user: User } >('user')
            .orFail( () => fail() )
            .then(doc => {
                const inserted = doc.user;
                expect(inserted._id).toEqual(u._id);
        })

    })

    afterAll(() => {
        // UserModel.deleteMany({ })
        // db.close();
    })
})

describe("Task Model Tests", () => {
    beforeAll(() => {
        dotenv.config({ path: `.env.${process.env.NODE_ENV}`});
        db.collection('app_test_users');
    })

    const mockContent = "Some Contents";

    it("Task Type", () => {
        const t = new TaskModel({ content: mockContent } )

        expect(t._id).toBeDefined();
        console.log(t._id)
        expect(t.content).toEqual(mockContent);
    })

    it("Task any type", () => {
        const t = new TaskModel({ content: { task_type: "image_generation", prompts: ["a cat"]}})

        expect(t._id).toBeDefined();
        console.log(t._id)
    })

    it("Task Storage", async () => {
        const t = new TaskModel({ content: mockContent } )

        await t.save();
        const tId = t._id;

        TaskModel.findOne({ _id: tId })
            .populate<{ task: Task }>('task')
            .orFail( () => fail() )
            .then( doc => {
                expect(doc.task._id).toEqual(tId);
                expect(doc.task.content).toEqual(mockContent)
        })
    })

    it("TaskModel.create", async () => {
        const t = await TaskModel.create( new CreateTaskDto(mockContent) );
        expect(t.content).toEqual(mockContent);
    })
})
