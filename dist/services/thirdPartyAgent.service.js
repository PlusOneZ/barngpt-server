"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const task_model_1 = require("../models/task.model");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const openaiResponse_model_1 = require("../models/openaiResponse.model");
const file_service_1 = __importDefault(require("./file.service"));
const prompts_1 = require("../utils/prompts");
const audio_service_1 = __importDefault(require("./audio.service"));
const constants_1 = require("../utils/constants");
const constants_2 = require("../utils/constants");
const logging_1 = require("../utils/logging");
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
class ThirdPartyAgentService {
    constructor() {
        this.tasks = task_model_1.TaskModel;
        this.openaiResponse = openaiResponse_model_1.OpenaiResponseModel;
        this.fileService = new file_service_1.default();
        this.audioService = new audio_service_1.default();
        this.responseHandler = (url) => {
            return (response) => {
                logging_1.log.debug(`Response (success) from URL ${url}: ${response}`);
                logging_1.log.debug(response.status);
                logging_1.log.debug(response.body);
            };
        };
        this.errorHandler = (url, data, taskId, taskType) => {
            return async (error) => {
                await this.taskUpdate(taskId, {
                    results: [{
                            type: "error",
                            message: "Unknown error. Internal server error.",
                            target_task: taskType,
                            err_body: error.toString(),
                            usage: 0
                        }],
                    status: "failed"
                });
                logging_1.log.error(`Error from URL ${url}: ${error}`);
            };
        };
        if (!process.env.THIRD_PARTY_AGENT_API) {
            logging_1.log.info(process.env.THIRD_PARTY_AGENT_API);
            logging_1.log.error("API URL is missing.");
            process.exit(1);
        }
        this.API_URL = process.env.THIRD_PARTY_AGENT_API;
        this.HOST = process.env.HOST;
        this.PORT = process.env.PORT;
    }
    getAllModelPrices(currency) {
        // every number entry in MODEL_PRICES times currency
        return (0, constants_2.modelPrices)(currency);
    }
    getAllModels() {
        return Object.keys((0, constants_2.modelPrices)(1));
    }
    async doTask(taskData) {
        const taskId = taskData._id.toString();
        const taskModel = taskData.model;
        // const hook = this.createHook(taskId);
        const prompts = (0, prompts_1.removePromptId)(taskData.content.prompts);
        const options = taskData.options;
        switch (taskData.taskType) {
            case "chat":
                return this.sendChatReq(taskId, prompts, taskModel);
            case "image-generation":
                return this.sendImageGenReq(taskId, {
                    image_prompt: (0, prompts_1.composePrompts)(prompts)
                }, taskModel, options);
            case "image-recognition":
                return this.sendVisionReq(taskId, prompts, taskModel);
            case "audio-generation":
                return this.textToSpeechCall(taskId, (0, prompts_1.composePrompts)(prompts), taskModel);
            case "audio-recognition":
                return this.speechToTextCall(taskId, prompts[0].content, taskModel);
            default:
                return this.sendDummyReq(taskId);
        }
    }
    async sendChatReq(tid, prompts, model) {
        const hook = this.createHook(tid);
        const url = this.API_URL + "/task/chat";
        axios_1.default.post(url, { data: prompts, hook: hook, model: model })
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts, tid, "chat"));
    }
    async sendImageGenReq(tid, data, model, options) {
        // send a image generation request
        const hook = this.createHook(tid);
        const url = this.API_URL + "/task/image/generation";
        axios_1.default.post(url, { data: data, hook: hook, model: model, options: options })
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, data, tid, "image-generation"));
    }
    async sendVisionReq(tid, prompts, model) {
        const url = this.API_URL + "/task/vision";
        const hook = this.createHook(tid);
        // log(prompts)
        axios_1.default.post(url, { data: prompts, hook: hook, model: model })
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts, tid, "image-recognition"));
    }
    async textToSpeechCall(taskId, text, model) {
        logging_1.log.info(`Generating audio for task ${taskId}`);
        let results = [];
        let state;
        let response = undefined;
        try {
            const rateControl = await axios_1.default.post(this.API_URL + "/task/audio/generation");
            if (rateControl.status === 200) {
                const mp3 = await this.audioService.textToSpeech(text, model);
                results = mp3 ?
                    [{ type: "audio-generation",
                            "url": await this.fileService.saveAudioFile(mp3, taskId),
                            "usage": (0, constants_1.getTTSPrice)(text.split(/[^a-zA-Z0-9]+/).length, model) }]
                    : [{ type: "error", "content": "Failed to generate audio." }];
                state = mp3 ? "done" : "failed";
                response = mp3;
            }
            else if (rateControl.status === 429) {
                logging_1.log.error("Rate limit reached, try again later.");
                results = [{ type: "error", "content": rateControl.data }];
                state = "rejected";
            }
            else {
                logging_1.log.error(`Unexpected response from audio generation: ${rateControl.status}`);
                results = [{ type: "error", "message": "this task will not be charged", target_task: "audio-generation" }];
                state = "failed";
            }
        }
        catch (e) {
            logging_1.log.error(`Unexpected response from audio generation: ${e.status}`);
            results = [{ type: "3rd_party_error", "message": e.message, target_task: "audio-generation" }];
            state = "failed";
        }
        await this.taskUpdate(taskId, {
            results: results,
            status: state,
            apiResponse: response
        });
        logging_1.log.info(`Audio generation for ${taskId} done.`);
    }
    async speechToTextCall(taskId, audioPath, model) {
        logging_1.log.info(`Recognizing audio for task ${taskId}`);
        const rateControl = await axios_1.default.post(this.API_URL + "/task/audio/recognition");
        if (rateControl.status !== 200) {
            logging_1.log.error("Rate limit reached, try again later.");
            await this.taskUpdate(taskId, { results: [{ type: "error", "content": rateControl.data }], status: "rejected" });
            return;
        }
        const audioName = audioPath.split('/').pop();
        try {
            const resp = await this.audioService.speechToText(audioName, model);
            const text = resp.text;
            const results = resp ?
                [{ type: "audio-recognition",
                        "text": text,
                        usage: (0, constants_1.getWhisperPrice)(await this.fileService.getAudioDuration(audioName)) }]
                : [{ type: "error", "message": "Failed to recognize audio.", target_task: "audio-recognition" }];
            await this.taskUpdate(taskId, {
                results: results,
                status: resp ? "done" : "failed",
                apiResponse: resp
            });
            logging_1.log.info(`Audio recognition for ${taskId} done.`);
        }
        catch (e) {
            logging_1.log.error(`Error while recognizing audio ${audioName}: ${e}`);
            await this.taskUpdate(taskId, {
                results: [{ type: "3rd_party_error", "message": e.message, target_task: "audio-recognition" }],
                status: "rejected"
            });
        }
    }
    async sendDummyReq(tid) {
        // send a dummy request
        const hook = this.createHook(tid);
        const url = this.API_URL + "/task/dummy";
        axios_1.default.post(url, { hook: hook })
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, "dummy task", tid, "dummy"));
    }
    /**
     * Create a webhook of route /task/:id/hook
     */
    createHook(taskId) {
        const hook = `http://${this.HOST}:${this.PORT}/task/${taskId}/hook`;
        // log(`Hook created: ${hook}`);
        return hook;
    }
    async taskUpdate(taskId, taskData) {
        if (!taskId) {
            logging_1.log.error(`Task ID is missing: ${taskId}`);
            return;
        }
        // option 1: only update the task status
        const { results, apiResponse, status } = taskData;
        const task = await this.tasks.findOne({ _id: taskId }).populate("ownerId").exec();
        if (!task) {
            logging_1.log.error(`Task ${taskId} not found.`);
            return;
        }
        let currencyUsed = 10.;
        if (task.ownerId) {
            const owner = task.ownerId;
            const currency = owner.currency ? owner.currency : currencyUsed;
            currencyUsed = currency;
            results.forEach((r) => {
                if (r.usage) {
                    owner.deductCredits(r.usage * currency);
                }
            });
        }
        else {
            logging_1.log.warn(`Task ${taskId} not charged.`);
        }
        const saveResults = results.map((r) => {
            if (r.type === "image-generation") {
                // save image (r.url) to 'public/image' with taskID as file name.
                this.fileService.saveImageFromUrl(r.content, `${taskId}.png`);
                return {
                    type: r.type,
                    url: this.fileService.imageUrl(`${taskId}.png`),
                    usage: r.usage ? r.usage * currencyUsed : 0
                };
            }
            return {
                ...r,
                usage: r.usage ? r.usage * currencyUsed : 0
            };
        });
        if (results) {
            // update task status
            this.tasks.updateOne({ _id: taskId }, {
                status: status,
                $push: { results: { $each: saveResults } }
            }).then(() => {
                logging_1.log.info(`Task ${taskId} updated.`);
                if (apiResponse) {
                    this.openaiResponse.create({
                        taskId: taskId,
                        response: apiResponse
                    });
                }
            }).catch((e) => {
                logging_1.log.error(`Error while updating Task ${taskId}: ${e}`);
            });
        }
    }
}
exports.default = ThirdPartyAgentService;
//# sourceMappingURL=thirdPartyAgent.service.js.map