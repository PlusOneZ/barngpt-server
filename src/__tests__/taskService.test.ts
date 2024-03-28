import {TaskService} from "../services/task.service";
import {CreateTaskDto} from "../dtos/task.dto";
import {db} from "../utils/db";

describe("Task Service", () => {
    let ts: TaskService;
    let mockTaskDto: CreateTaskDto

    beforeAll(() => {
        ts = new TaskService()
        mockTaskDto = new CreateTaskDto("Some Content Mocked")
        db.collection('app_test_users');
    })

    it("Create task", async () => {
        const saved = await ts.createTask(mockTaskDto);
        expect(saved).toBeDefined()
        expect(saved.content).toEqual("Some Content Mocked")
    }, 10000)

    afterAll(() => {

    })
})