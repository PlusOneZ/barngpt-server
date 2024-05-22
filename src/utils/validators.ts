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

export const chatPromptSchema = Joi.alternatives().try(
    Joi.object().keys({
        role: Joi.string().valid("user", "system", "assistant").required(),
        content: Joi.string().required(),
    }),
    Joi.string().required()
);

export const imageRecognitionPromptSchema = Joi.object().keys({
    role: Joi.string().required(),
    content: Joi.array().items(Joi.object().keys({
        type: Joi.string().valid("text", "image_url").required(),
        text: Joi.string().when("type", { is: "text", then: Joi.required() }),
        image_url: Joi.string().when("type", { is: "image_url", then: Joi.required() }),
    })).min(1).required(),
});

export const audioRecognitionPromptSchema = Joi.object().keys({
    role: Joi.string().valid("audio-url").required(),
    content: Joi.string().required(),
    // todo: set this a URI after using domain name
});

export const forComposePromptSchema = Joi.alternatives().try(
    Joi.object().keys({
        role: Joi.string().valid("user").required(),
        content: Joi.string().required(),
    }),
    Joi.string().required()
);

export const taskSchema = Joi.object().keys({
    taskType: Joi.string().required(),
    content: Joi.object().keys({
        prompts: Joi.array().required().when("taskType", {
            switch: [
                { is: "chat", then: Joi.array().items(chatPromptSchema) },
                { is: "image-recognition", then: Joi.array().items(imageRecognitionPromptSchema).length(1) },
                { is: "audio-recognition", then: Joi.array().items(audioRecognitionPromptSchema).length(1) },
            ],
            otherwise: Joi.array().items(forComposePromptSchema)
        })
    }).required(),
});

