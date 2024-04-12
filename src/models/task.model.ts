import { InferSchemaType, model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const promptSchema = new Schema({
    role: { type: String, default: "user" },
    content: { type: String, required: true }
});

const taskSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID,
    },
    content: {
        type: { prompts: [promptSchema] },
        required: true,
    },
    taskType: {
        type: String,
        required: true,
        default: "dummy",
        enum: [
            "dummy", "chat",
            "image-generation", "image-recognition",
            "audio-generation", "audio-recognition"
        ]
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "done", "failed", "rejected"]
    },
    // ownerId: { type: Schema.Types.UUID, ref: 'User' }, // user's ID
    results: [Schema.Types.Mixed]
}, { timestamps: true })

type Task = InferSchemaType<typeof taskSchema>;
type Prompt = InferSchemaType<typeof promptSchema>;

const TaskModel = model("Task", taskSchema)

export {
    Task,
    Prompt,
    TaskModel,
}