"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const taskSchema = new mongoose_1.Schema({
    _id: {
        type: mongoose_1.Schema.Types.UUID,
        default: (0, crypto_1.randomUUID)({ disableEntropyCache: true }),
    },
    content: { type: String, required: true },
    status: { type: String, default: "pending" },
    // ownerId: { type: Schema.Types.UUID, ref: 'User' }, // user's ID
    results: [mongoose_1.Schema.Types.Mixed]
}, { timestamps: true });
const TaskModel = (0, mongoose_1.model)("Task", taskSchema);
exports.TaskModel = TaskModel;
