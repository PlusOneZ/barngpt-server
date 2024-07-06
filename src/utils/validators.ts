import Joi from 'joi';

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
        )).min(1).required()
    }).required(),
    model: Joi.string().valid("defer", "gpt-3.5-turbo", "gpt-4o", "gpt-4", "gpt-4-turbo")
});

const getSchema = (...models: string[])=> {
    return Joi.object().keys({
        taskType: Joi.string().required(),
        content: Joi.object().keys({
            prompts: Joi.array().items(Joi.alternatives().try(
                Joi.object().keys({
                    role: Joi.string().valid("user").required(),
                    content: Joi.string().required(),
                }),
                Joi.string().required()
            )).min(1).required()
        }).required(),
        model: Joi.string().valid("defer", ...models)
    });
}

const imageGenerationSchema = getSchema("dall-e-2", "dall-e-3")
const audioGenerationSchema = getSchema( "tts-1", "tts-1-hd")

const imageRecognitionSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.object().keys({
            role: Joi.string().valid("user").required(),
            content: Joi.array().items(Joi.object().keys({
                type: Joi.string().valid("text", "image_url").required(),
                text: Joi.string().when("type", { is: "text", then: Joi.required() }),
                image_url: Joi.object().keys(
                    {url: Joi.string().required()} // TODO make it uri when using domain name
                ).when("type", { is: "image_url", then: Joi.required() }),
            })).min(1).required().has(Joi.object().keys({
                type: Joi.string().valid("image_url"),
                image_url: Joi.object()
            }))
            // must have a image_url item
        })).min(1).required()
    }).required(),
});

const audioRecognitionSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().items(Joi.object().keys({
            role: Joi.string().valid("audio-url").required(),
            content: Joi.string().required(),
            // todo: set this a URI after using domain name
        })).min(1).required()
    }).required(),
    model: Joi.string().valid("defer", "whisper-1")
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
            return chatSchema.validate(task);
    }
}
