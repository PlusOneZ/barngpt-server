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
const db_1 = require("../utils/db");
describe("Task Service", () => {
    let ts;
    let mockTaskDto;
    beforeAll(() => {
        ts = new task_service_1.default();
        mockTaskDto = new task_dto_1.CreateTaskDto("Some Content Mocked");
        db_1.db.collection('app_test_users');
    });
    it("Create task", () => __awaiter(void 0, void 0, void 0, function* () {
        const saved = yield ts.createTask(mockTaskDto);
        expect(saved).toBeDefined();
        expect(saved.content).toEqual("Some Content Mocked");
    }), 10000);
    it("Find some", () => __awaiter(void 0, void 0, void 0, function* () {
        const some = yield ts.findSomeTasks(5);
        // console.log(some);
        expect(some.length).toBeLessThan(6);
        expect(some[0].content).toBeDefined();
    }));
    afterAll(() => {
    });
});
