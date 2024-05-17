import {InferSchemaType, model, Schema} from "mongoose";

const openaiResponseSchema = new Schema({
    response: {
        type: Schema.Types.Mixed
    },
    taskId: {
        type: Schema.Types.UUID,
        required: true,
        ref: 'Task'
    }
}, { timestamps: true });

type OpenaiResponse = InferSchemaType<typeof openaiResponseSchema>;

const OpenaiResponseModel = model("OpenaiResponse", openaiResponseSchema);

export {
    OpenaiResponse,
    OpenaiResponseModel
}