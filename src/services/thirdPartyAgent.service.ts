import {Task, TaskModel} from "../models/task.model";
import axios from "axios";
import dotenv from "dotenv";
import {OpenaiResponseModel} from "../models/openaiResponse.model";
import FileService from "./file.service";
import {composePrompts, removePromptId} from "../utils/prompts";
import AudioService from "./audio.service";
import { getWhisperPrice, getTTSPrice } from "../utils/constants";
import { modelPrices } from "../utils/constants";

import { log } from "../utils/logging";


dotenv.config({path: `.env.${process.env.NODE_ENV}`})

class ThirdPartyAgentService {
    public readonly API_URL: string;
    private readonly HOST: string;
    private readonly PORT: string;
    private readonly API_PREFIX: string;
    private tasks = TaskModel;
    private openaiResponse = OpenaiResponseModel;
    private fileService = new FileService();
    private audioService = new AudioService();

    constructor() {
        if (!process.env.THIRD_PARTY_AGENT_API) {
            log.info(process.env.THIRD_PARTY_AGENT_API)
            log.error("API URL is missing.");
            process.exit(1);
        }
        this.API_URL = process.env.THIRD_PARTY_AGENT_API!;
        this.HOST = process.env.HOST!;
        this.PORT = process.env.PORT!;
	this.API_PREFIX = process.env.API_PREFIX!;
    }

    private readonly responseHandler = (url: string) => {
        return (response: any) => {
            log.debug(`Response (success) from URL ${url}: ${response}`);
            log.debug(response.status)
            log.debug(response.body)
        }
    }

    private readonly errorHandler = (url: string, data: any, taskId: string, taskType: string) => {
        return async (error: any) => {
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
            log.error(`Error from URL ${url}: ${error}`);
        }
    }

    public getAllModelPrices(currency: number) {
        // every number entry in MODEL_PRICES times currency
        return modelPrices(currency);
    }

    public getAllModels() {
        return Object.keys(modelPrices(1));
    }

    public async doTask(taskData: Task) {
        const taskId = taskData._id.toString();
        const taskModel = taskData.model;
        // const hook = this.createHook(taskId);
        const prompts = removePromptId(taskData.content.prompts);
        const options = taskData.options;
        switch (taskData.taskType) {
            case "chat":
                return this.sendChatReq(taskId, prompts, taskModel);
            case "image-generation":
                return this.sendImageGenReq(taskId, {
                    image_prompt: composePrompts(prompts)
                }, taskModel, options);
            case "image-recognition":
                return this.sendVisionReq(taskId, prompts, taskModel);
            case "audio-generation":
                return this.textToSpeechCall(taskId, composePrompts(prompts), taskModel)
            case "audio-recognition":
                return this.speechToTextCall(taskId, prompts[0].content, taskModel)
            default:
                return this.sendDummyReq(taskId);
        }
    }

    private async sendChatReq(tid: string, prompts: any, model: string) {
        const hook = this.createHook(tid);
        const url = this.API_URL + "/task/chat"
        axios.post(url, {data: prompts, hook: hook, model: model})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts, tid, "chat"));
    }

    private async sendImageGenReq(tid: string, data: { image_prompt: string }, model: string, options: any) {
        // send a image generation request
        const hook = this.createHook(tid);
        const url = this.API_URL + "/task/image/generation"
        axios.post(url, {data: data, hook: hook, model: model, options: options})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, data, tid, "image-generation"));
    }

    private async sendVisionReq(tid: string, prompts: any, model: string) {
        const url = this.API_URL + "/task/vision";
        const hook = this.createHook(tid);
        // log(prompts)
        axios.post(url, {data: prompts, hook: hook, model: model})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts, tid, "image-recognition"));
    }

    private async textToSpeechCall(taskId: string, text: string, model: string) {
        log.info(`Generating audio for task ${taskId}`);
        let results: any[] = [];
        let state;
        let response: any = undefined
        try {
            const rateControl = await axios.post(this.API_URL + "/task/audio/generation");
            if (rateControl.status === 200) {
                const mp3 = await this.audioService.textToSpeech(text, model);
                results = mp3 ?
                    [{type: "audio-generation",
                      "url": await this.fileService.saveAudioFile(mp3, taskId),
                      "usage": getTTSPrice(text.split(/[^a-zA-Z0-9]+/).length, model)}]
                    : [{type: "error", "content": "Failed to generate audio."}];
                state = mp3 ? "done" : "failed";
                response = mp3;
            } else if (rateControl.status === 429) {
                log.error("Rate limit reached, try again later.");
                results = [{type: "error", "content": rateControl.data}];
                state = "rejected";
            } else {
                log.error(`Unexpected response from audio generation: ${rateControl.status}`);
                results = [{type: "error", "message": "this task will not be charged", target_task: "audio-generation"}];
                state = "failed";
            }
        } catch (e: any) {
            log.error(`Unexpected response from audio generation: ${e.status}`);
            results = [{type: "3rd_party_error", "message": e.message, target_task: "audio-generation"}];
            state = "failed";
        }
        await this.taskUpdate(
            taskId,
            {
                results: results,
                status: state,
                apiResponse: response
            }
        );
        log.info(`Audio generation for ${taskId} done.`);
    }

    private async speechToTextCall(taskId: string, audioPath: string, model : string) {
        log.info(`Recognizing audio for task ${taskId}`)
        const rateControl = await axios.post(this.API_URL + "/task/audio/recognition");
        if (rateControl.status !== 200) {
            log.error("Rate limit reached, try again later.");
            await this.taskUpdate(taskId, { results: [{type: "error", "content": rateControl.data}], status: "rejected"});
            return;
        }
        const audioName = audioPath.split('/').pop();
        try {
            const resp = await this.audioService.speechToText(audioName!, model);
            const text = resp.text!;
            const results = resp ?
                [{type: "audio-recognition",
                    "text": text,
                    usage: getWhisperPrice(await this.fileService.getAudioDuration(audioName!))}]
                : [{type: "error", "message": "Failed to recognize audio.", target_task: "audio-recognition"}];
            await this.taskUpdate(
                taskId,
                {
                    results: results,
                    status: resp ? "done" : "failed",
                    apiResponse: resp
                }
            );
            log.info(`Audio recognition for ${taskId} done.`);
        } catch (e: any) {
            log.error(`Error while recognizing audio ${audioName}: ${e}`);
            await this.taskUpdate(taskId, {
                results: [{type: "3rd_party_error", "message": e.message, target_task: "audio-recognition"}],
                status: "rejected"
            });
        }
    }

    private async sendDummyReq(tid: string) {
        // send a dummy request
        const hook = this.createHook(tid)
        const url = this.API_URL + "/task/dummy"
        axios.post(url, {hook: hook})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, "dummy task", tid, "dummy"));
    }

    /**
     * Create a webhook of route /task/:id/hook
     */
    public createHook(taskId: string): string {
        const hook: string = `http://${this.HOST}:${this.PORT}${this.API_PREFIX}/task/${taskId}/hook`;
        // log(`Hook created: ${hook}`);
        return hook;
    }

    public async taskUpdate(taskId: string | undefined, taskData: any) {
        if (!taskId) {
            log.error(`Task ID is missing: ${taskId}`);
            return;
        }
        // option 1: only update the task status
        const {results, apiResponse, status} = taskData;
        const task = await this.tasks.findOne({_id: taskId}).populate("ownerId").exec()
        if (!task) {
            log.error(`Task ${taskId} not found.`);
            return;
        }
        let currencyUsed = 10.
        if (task.ownerId) {
            const owner = task.ownerId as any;
            const currency = owner.currency ? owner.currency : currencyUsed;
            currencyUsed = currency
            results.forEach((r: any) => {
                if (r.usage) {
                    owner.deductCredits(r.usage * currency);
                }
            })
        } else {
            log.warn(`Task ${taskId} not charged.`)
        }
        const saveResults = results.map((r: any) => {
            if (r.type === "image-generation") {
                // save image (r.url) to 'public/image' with taskID as file name.
                log.info(r.content)
                const filename = this.fileService.saveImageFromUrl(r.content, `${taskId}`)
                return {
                    type: r.type,
                    url: this.fileService.imageUrl(filename),
                    usage: r.usage? r.usage * currencyUsed : 0
                }
            }
            return {
                ...r,
                usage: r.usage? r.usage * currencyUsed : 0
            }
        })
        if (results) {
            // update task status
            this.tasks.updateOne(
                {_id: taskId},
                {
                    status: status,
                    $push: {results: {$each: saveResults}}
                },
            ).then(() => {
                log.info(`Task ${taskId} updated.`);
                if (apiResponse) {
                    this.openaiResponse.create({
                        taskId: taskId,
                        response: apiResponse
                    });
                }
            }).catch((e) => {
                log.error(`Error while updating Task ${taskId}: ${e}`);
            });
        }
    }
}

export default ThirdPartyAgentService;
