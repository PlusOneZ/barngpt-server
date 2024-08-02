import { ObjectId } from "bson";
import { TaskModel } from "../models/task.model";

describe("Common", () => {
    it("bson object id", () => {
        const idStr = "66aca69a1e0ce49b7d827507";
        const id = new ObjectId(idStr);
        console.log(id);
    })

    it("req without user", () => {
        const req = { a: 1, user: undefined };
        console.log((req.user as any)?.id);
    })

    it("newest task of user", async () => {
        const t = await TaskModel.findOne({ "ownerId._id": new ObjectId("66aca69a1e0ce49b7d827507") })
        console.log(`Newest task: ${t}`);
    })
})