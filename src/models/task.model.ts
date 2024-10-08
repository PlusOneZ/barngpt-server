import { InferSchemaType, model, Schema } from "mongoose";
import { randomUUID } from "crypto";

const promptSchema = new Schema({
    role: { type: String, default: "user" },
    content: { type: Schema.Types.Mixed, required: true }
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
    model: {
        type: String,
        default: "default",
        enum: [
            "default",
            "gpt-3.5-turbo", "gpt-4o",
            "gpt-4", "gpt-4-turbo",
            "gpt-4o-mini", "gpt-4o-2024-08-06",
            "dall-e-2", "dall-e-3",
            "se1-flux1-schnell", "se1-flux1-dev",
            "whisper-1", "tts-1", "tts-1-hd"
        ]
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "done", "failed", "rejected"]
    },
    results: [Schema.Types.Mixed],
    ownerId: { type: Schema.Types.ObjectId, ref: 'BusinessUser' },
    options: { type: Schema.Types.Mixed },
}, { timestamps: true })

type Task = InferSchemaType<typeof taskSchema>;
type Prompt = InferSchemaType<typeof promptSchema>;

const TaskModel = model("Task", taskSchema)

export {
    Task,
    Prompt,
    TaskModel,
}