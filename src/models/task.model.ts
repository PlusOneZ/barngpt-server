import { InferSchemaType, model, Schema } from "mongoose";
import { randomUUID } from "crypto";


const taskSchema = new Schema({
    _id: {
        type: Schema.Types.UUID,
        default: randomUUID,
    },
    content: {
        type: Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (v: any) {
                return (typeof v == "string") || ('task_type' in v && 'prompts' in v)
            },
            message: (props: any) => `${props.value} does not compose a task content.`
        }
    },
    status: { type: String, default: "pending" },
    // ownerId: { type: Schema.Types.UUID, ref: 'User' }, // user's ID
    results: [Schema.Types.Mixed]
}, { timestamps: true })

type Task = InferSchemaType<typeof taskSchema>;

const TaskModel = model("Task", taskSchema)

export {
    Task,
    TaskModel,
}