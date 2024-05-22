import Joi from 'joi';
import exp from "constants";

export const loginSchema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(20).required(),
});

export const registerSchema = Joi.object().keys({
    name: Joi.string().trim().min(2).max(30).required(),
    username: Joi.string()
        .trim()
        .min(2)
        .max(20)
        .regex(/^[a-zA-Z0-9_]+$/)
        .required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(20).required(),
});


const chatSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.alternatives().try(
            Joi.object().keys({
                role: Joi.string().valid("user", "system", "assistant").required(),
                content: Joi.string().required(),
            }),
            Joi.string().required()
        ))
    }).required(),
});

const imageGenerationSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.alternatives().try(
            Joi.object().keys({
                role: Joi.string().valid("user").required(),
                content: Joi.string().required(),
            }),
            Joi.string().required()
        ))
    }).required(),
});

const imageRecognitionSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.object().keys({
            role: Joi.string().required(),
            content: Joi.array().items(Joi.object().keys({
                type: Joi.string().valid("text", "image_url").required(),
                text: Joi.string().when("type", { is: "text", then: Joi.required() }),
                image_url: Joi.object().keys(
                    {url: Joi.string().required()} // TODO make it uri when using domain name
                ).when("type", { is: "image_url", then: Joi.required() }),
            })).min(1).required(),
        }))
    }).required(),
});

const audioGenerationSchema = imageGenerationSchema;

const audioRecognitionSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.object().keys({
            role: Joi.string().valid("audio-url").required(),
            content: Joi.string().required(),
            // todo: set this a URI after using domain name
        }))
    }).required(),
});


export function validateTask(task: any) {
    switch (task.taskType) {
        case "chat":
            return chatSchema.validate(task);
        case "image-generation":
            return imageGenerationSchema.validate(task);
        case "image-recognition":
            return imageRecognitionSchema.validate(task);
        case "audio-generation":
            return audioGenerationSchema.validate(task);
        case "audio-recognition":
            return audioRecognitionSchema.validate(task);
        default:
            return Joi.object().validate(task);
    }
}
