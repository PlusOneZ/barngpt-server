"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = exports.validateUser = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const joi_1 = __importDefault(require("joi"));
const logging_1 = require("../utils/logging");
const userSchema = new mongoose_1.Schema({
    provider: {
        type: mongoose_1.Schema.Types.String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9_]+$/, 'is invalid'],
        index: true,
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true,
    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        maxlength: 60,
    },
    name: mongoose_1.Schema.Types.String,
    avatar: mongoose_1.Schema.Types.String,
    bio: mongoose_1.Schema.Types.String,
    // google
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // fb
    facebookId: {
        type: String,
        unique: true,
        sparse: true,
    },
    // todo: link to tasks
}, { timestamps: true });
userSchema.methods.toJSON = function () {
    return {
        id: this._id,
        provider: this.provider,
        email: this.email,
        username: this.username,
        name: this.name,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};
userSchema.method("registerUser", (newUser, callback) => {
    bcryptjs_1.default.genSalt(10, (err, salt) => {
        bcryptjs_1.default.hash(newUser.password, salt, async (errh, hash) => {
            if (err || errh) {
                logging_1.log.error(err, errh);
            }
            newUser.password = hash;
            await newUser.save().then(callback);
        });
    });
});
userSchema.method("comparePassword", function (candidatePassword, callback) {
    bcryptjs_1.default.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err)
            return callback(err);
        callback(null, isMatch);
    });
});
async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcryptjs_1.default.hash(password, saltRounds, function (err, hash) {
            if (err)
                reject(err);
            else
                resolve(hash);
        });
    });
    return hashedPassword;
}
exports.hashPassword = hashPassword;
const validateUser = (user) => {
    const schema = joi_1.default.object({
        avatar: joi_1.default.any(),
        name: joi_1.default.string().min(2).max(30).required(),
        username: joi_1.default.string()
            .min(2)
            .max(20)
            .regex(/^[a-zA-Z0-9_]+$/)
            .required(),
        password: joi_1.default.string().min(6).max(20).allow('').allow(null),
    });
    return schema.validate(user);
};
exports.validateUser = validateUser;
const UserModel = (0, mongoose_1.model)('User', userSchema);
exports.UserModel = UserModel;
//# sourceMappingURL=user.js.map