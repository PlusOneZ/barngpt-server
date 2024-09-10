"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenaiResponseModel = void 0;
const mongoose_1 = require("mongoose");
const openaiResponseSchema = new mongoose_1.Schema({
    response: {
        type: mongoose_1.Schema.Types.Mixed
    },
    taskId: {
        type: mongoose_1.Schema.Types.UUID,
        required: true,
        ref: 'Task'
    }
}, { timestamps: true });
const OpenaiResponseModel = (0, mongoose_1.model)("OpenaiResponse", openaiResponseSchema);
exports.OpenaiResponseModel = OpenaiResponseModel;
//# sourceMappingURL=openaiResponse.model.js.map