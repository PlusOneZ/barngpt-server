"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_1 = require("bson");
const task_model_1 = require("../models/task.model");
describe("Common", () => {
    it("bson object id", () => {
        const idStr = "66aca69a1e0ce49b7d827507";
        const id = new bson_1.ObjectId(idStr);
        console.log(id);
    });
    it("req without user", () => {
        var _a;
        const req = { a: 1, user: undefined };
        console.log((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    });
    it("newest task of user", async () => {
        const t = await task_model_1.TaskModel.findOne({ "ownerId._id": new bson_1.ObjectId("66aca69a1e0ce49b7d827507") });
        console.log(`Newest task: ${t}`);
    });
});
//# sourceMappingURL=common.test.js.map