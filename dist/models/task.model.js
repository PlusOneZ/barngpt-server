"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const promptSchema = new mongoose_1.Schema({
    role: { type: String, default: "user" },
    content: { type: mongoose_1.Schema.Types.Mixed, required: true }
});
const taskSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.UUID,
        default: crypto_1.randomUUID,
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
            "whisper-1", "tts-1", "tts-1-hd"
        ]
    },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "done", "failed", "rejected"]
    },
    results: [mongoose_1.Schema.Types.Mixed],
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BusinessUser' },
    options: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
const TaskModel = (0, mongoose_1.model)("Task", taskSchema);
exports.TaskModel = TaskModel;
//# sourceMappingURL=task.model.js.map