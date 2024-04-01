"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const crypto_1 = require("crypto");
const userSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.UUID, default: () => (0, crypto_1.randomUUID)() },
    name: { type: String, required: true },
    email: { type: String, required: true }, // TODO: Checking Format
    phone: String,
    avatar: String
}, { timestamps: true });
const UserModel = (0, mongoose_1.model)('User', userSchema);
exports.UserModel = UserModel;
