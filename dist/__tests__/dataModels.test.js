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
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../utils/db");
const user_1 = require("../models/user");
const task_model_1 = require("../models/task.model");
const task_dto_1 = require("../dtos/task.dto");
describe("User Model Test", () => {
    beforeAll(() => {
        dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
    });
    it("User Type", () => {
        const u = new user_1.UserModel({ name: "test user", email: "qwe@123.com" });
        expect(u.name).toBe("test user");
    });
    it("User storage", () => __awaiter(void 0, void 0, void 0, function* () {
        db_1.db.collection('app_test_users');
        const u = new user_1.UserModel({
            name: "test user",
            email: "qwe@123.com",
        });
        yield u.save();
        const userId = u._id;
        user_1.UserModel.findOne({ _id: u._id })
            .populate('user')
            .orFail(() => fail())
            .then(doc => {
            const inserted = doc.user;
            expect(inserted._id).toEqual(u._id);
        });
    }));
    afterAll(() => {
        // UserModel.deleteMany({ })
        // db.close();
    });
});
describe("Task Model Tests", () => {
    beforeAll(() => {
        dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
        db_1.db.collection('app_test_users');
    });
    const mockContent = "Some Contents";
    it("Task Type", () => {
        const t = new task_model_1.TaskModel({ content: mockContent });
        expect(t._id).toBeDefined();
        console.log(t._id);
        expect(t.content).toEqual(mockContent);
    });
    it("Task Storage", () => __awaiter(void 0, void 0, void 0, function* () {
        const t = new task_model_1.TaskModel({ content: mockContent });
        yield t.save();
        const tId = t._id;
        task_model_1.TaskModel.findOne({ _id: tId })
            .populate('task')
            .orFail(() => fail())
            .then(doc => {
            expect(doc.task._id).toEqual(tId);
            expect(doc.task.content).toEqual(mockContent);
        });
    }));
    it("TaskModel.create", () => __awaiter(void 0, void 0, void 0, function* () {
        const t = yield task_model_1.TaskModel.create(new task_dto_1.CreateTaskDto(mockContent));
        expect(t.content).toEqual(mockContent);
    }));
});
