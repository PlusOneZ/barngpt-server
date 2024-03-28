import { Schema, InferSchemaType, model } from "mongoose";
import { randomUUID } from "crypto"

const userSchema = new Schema({
    _id: { type: Schema.Types.UUID, default: () => randomUUID()},
    name: { type: String, required: true },
    email: { type: String, required: true }, // TODO: Checking Format
    phone: String,
    avatar: String
}, { timestamps: true })

type User = InferSchemaType<typeof userSchema>;

const UserModel = model('User', userSchema)

export {
    UserModel,
    User
}