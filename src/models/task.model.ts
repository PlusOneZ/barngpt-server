import { InferSchemaType, model, Schema } from "mongoose";
import { randomUUID } from "crypto";


const taskSchema = new Schema({
    _id: { type: Schema.Types.UUID, default: () => randomUUID()},
    content: { type: String, required: true },
    // ownerId: { type: Schema.Types.UUID, ref: 'User' }, // user's ID
    results: [Schema.Types.Mixed]
}, { timestamps: true })

type Task = InferSchemaType<typeof taskSchema>;

const TaskModel = model("Task", taskSchema)

export {
    Task,
    TaskModel,
}