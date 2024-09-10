"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTask = exports.businessJwtPayloadSchema = exports.businessRegisterSchema = exports.registerSchema = exports.businessLoginSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object().keys({
    email: joi_1.default.string().trim().email().required(),
    password: joi_1.default.string().trim().min(6).max(20).required(),
});
exports.businessLoginSchema = joi_1.default.object().keys({
    identifier: joi_1.default.string().trim().required(),
    password: joi_1.default.string().trim().min(6).max(20).required(),
});
exports.registerSchema = joi_1.default.object().keys({
    name: joi_1.default.string().trim().min(2).max(30).required(),
    username: joi_1.default.string()
        .trim()
        .min(2)
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/)
        .required(),
    email: joi_1.default.string().trim().email().required(),
    password: joi_1.default.string().trim().min(6).max(20).required(),
});
exports.businessRegisterSchema = joi_1.default.object().keys({
    identifier: joi_1.default.string().alphanum().trim().min(2).max(30).required(),
    description: joi_1.default.string().required(),
    password: joi_1.default.string().trim().min(6).max(40).required(),
});
exports.businessJwtPayloadSchema = joi_1.default.object().keys({
    id: joi_1.default.string().required(),
    identifier: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    enableIpCheck: joi_1.default.boolean().required(),
    iat: joi_1.default.number(),
    exp: joi_1.default.number(),
});
const chatSchema = joi_1.default.object().keys({
    taskType: joi_1.default.string().required(),
    content: joi_1.default.object().keys({
        prompts: joi_1.default.array().items(joi_1.default.alternatives().try(joi_1.default.object().keys({
            role: joi_1.default.string().valid("user", "system", "assistant").required(),
            content: joi_1.default.string().required(),
        }), joi_1.default.string().required())).min(1).required()
    }).required(),
    model: joi_1.default.string().valid("default", "gpt-3.5-turbo", "gpt-4o", "gpt-4", "gpt-4-turbo", "gpt-4o-mini", "gpt-4o-2024-08-06")
});
const getSchema = (...models) => {
    return joi_1.default.object().keys({
        taskType: joi_1.default.string().required(),
        content: joi_1.default.object().keys({
            prompts: joi_1.default.array().items(joi_1.default.alternatives().try(joi_1.default.object().keys({
                role: joi_1.default.string().valid("user").required(),
                content: joi_1.default.string().required(),
            }), joi_1.default.string().required())).min(1).required()
        }).required(),
        model: joi_1.default.string().valid("default", ...models),
        options: joi_1.default.object().keys({
            size: joi_1.default.string(),
            quality: joi_1.default.string(),
        })
    });
};
const imageGenerationSchema = getSchema("dall-e-2", "dall-e-3");
const audioGenerationSchema = getSchema("tts-1", "tts-1-hd");
const imageRecognitionSchema = joi_1.default.object().keys({
    taskType: joi_1.default.string().required(),
    content: joi_1.default.object().keys({
        prompts: joi_1.default.array().items(joi_1.default.object().keys({
            role: joi_1.default.string().valid("user").required(),
            content: joi_1.default.array().items(joi_1.default.object().keys({
                type: joi_1.default.string().valid("text", "image_url").required(),
                text: joi_1.default.string().when("type", { is: "text", then: joi_1.default.required() }),
                image_url: joi_1.default.object().keys({ url: joi_1.default.string().required() } // TODO make it uri when using domain name
                ).when("type", { is: "image_url", then: joi_1.default.required() }),
            })).min(1).required().has(joi_1.default.object().keys({
                type: joi_1.default.string().valid("image_url"),
                image_url: joi_1.default.object()
            }))
            // must have a image_url item
        })).min(1).required()
    }).required(),
    model: joi_1.default.string().valid("default", "gpt-4o", "gpt-4-turbo", "gpt-4o-mini", "gpt-4o-2024-08-06")
});
const audioRecognitionSchema = joi_1.default.object().keys({
    taskType: joi_1.default.string().required(),
    content: joi_1.default.object().keys({
        prompts: joi_1.default.array().items(joi_1.default.object().keys({
            role: joi_1.default.string().valid("audio-url").required(),
            content: joi_1.default.string().required(),
            // todo: set this a URI after using domain name
        })).min(1).required()
    }).required(),
    model: joi_1.default.string().valid("default", "whisper-1")
});
function validateTask(task) {
    switch (task.taskType) {
        case "chat":
            return chatSchema.validate(task);
        case "image-generation":
            const res = imageGenerationSchema.validate(task);
            if (res.error)
                return res;
            if (task.model && task.model === "dall-e-2") {
                if (task.options) {
                    return joi_1.default.object().keys({
                        size: joi_1.default.string().valid("256x256", "512x512", "1024x1024"),
                        quality: joi_1.default.string().valid("standard")
                    }).validate(task.options);
                }
            }
            else if (task.model && task.model === "dall-e-3") {
                if (task.options) {
                    return joi_1.default.object().keys({
                        size: joi_1.default.string().valid("1024x1024", "1024x1792", "1792x1024"),
                        quality: joi_1.default.string().valid("standard", "hd")
                    }).validate(task.options);
                }
            }
            return res;
        case "image-recognition":
            return imageRecognitionSchema.validate(task);
        case "audio-generation":
            return audioGenerationSchema.validate(task);
        case "audio-recognition":
            return audioRecognitionSchema.validate(task);
        default:
            return chatSchema.validate(task);
    }
}
exports.validateTask = validateTask;
//# sourceMappingURL=validators.js.map