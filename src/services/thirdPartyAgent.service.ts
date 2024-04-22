import {Prompt, Task, TaskModel} from "../models/task.model";
import axios from "axios";
import dotenv from "dotenv";
import {OpenaiResponseModel} from "../models/openaiResponse.model";
import FileService from "./file.service";
import {composePrompts, removePromptId} from "../utils/prompts";
import AudioService from "./audio.service";
import OpenAI from "openai";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class ThirdPartyAgentService {
    public readonly API_URL: string;
    private readonly HOST: string;
    private readonly PORT: string;
    private tasks = TaskModel;
    private openaiResponse = OpenaiResponseModel;
    private fileService = new FileService();
    private audioService = new AudioService();
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    constructor() {
        if (!process.env.THIRD_PARTY_AGENT_API) {
            console.log(process.env.THIRD_PARTY_AGENT_API)
            console.error("API URL is missing.");
            process.exit(1);
        }
        this.API_URL = process.env.THIRD_PARTY_AGENT_API!;
        this.HOST = process.env.HOST!;
        this.PORT = process.env.PORT!;
    }

    private readonly responseHandler = (url: string) => {
        return (response: any) => {
            console.log(`Response (success) from URL ${url}: ${response}`);
        }
    }

    private readonly errorHandler = (url: string, data: any) => {
        return (error: any) => {
            console.log(`Error from URL ${url}: ${error}`);
        }
    }

    public async doTask(taskData: Task) {
        const taskId = taskData._id.toString()
        const hook = this.createHook(taskId);
        const prompts = removePromptId(taskData.content.prompts);
        switch (taskData.taskType) {
            case "chat":
                return this.sendChatReq(hook, prompts);
            case "image-generation":
                return this.sendImageGenReq(hook, {
                        image_prompt: composePrompts(prompts)
                    });
            case "image-recognition":
                return this.sendVisionReq(hook, prompts);
            case "audio-generation":
                return this.textToSpeechCall(taskId, composePrompts(prompts))
            case "audio-recognition":
                return this.sendAudioConvertingReq(hook, {
                    audio: taskData.content.prompts[0].content}
                );
            default:
                return this.sendDummyReq(hook);
        }
    }

    private async sendChatReq(hook: string, prompts: any) {
        const url = this.API_URL + "/task/chat"
        axios.post(url, {data: prompts, hook: hook})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts));
    }

    private async sendImageGenReq(hook: string, data: {image_prompt: string}) {
        // send a image generation request
        const url = this.API_URL + "/task/image/generation"
        axios.post(url, {json: {data: data, hook: hook}})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, data));
    }

    private async sendVisionReq(hook: string, prompts: any) {
        const url = this.API_URL + "/task/vision"
        console.log(prompts)
        axios.post(url, {data: prompts, hook: hook})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, prompts));
    }

    private async textToSpeechCall(taskId: string, text: string) {
        try {
            console.log(`Generating audio for task ${taskId}`);
            const mp3 = await this.openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text
            })
            console.log("return from textToSpeech");
            if (mp3) {
                const url = await this.fileService.saveAudioFile(mp3, taskId);
                this.taskUpdate(
                    taskId,
                    {
                        results: [{type: "audio-generation", "url": url}],
                        status: "done",
                        apiResponse: mp3
                    }
                );
                console.log("Audio generation done.");
            } else {
                throw new Error("Error while converting text to speech.");
            }
        } catch (e) {
            console.error(`Error while generating audio: ${e}`);
        }
    }

    private async sendAudioConvertingReq(hook: string, data: {audio: string}) {
        const url = this.API_URL + "/task/stt"
        axios.post(url, {data: data, hook: hook})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, data));
    }

    private async sendDummyReq(hook: string) {
        // send a dummy request
        const url = this.API_URL + "/task/dummy"
        axios.post(url, {hook: hook})
            .then(this.responseHandler(url))
            .catch(this.errorHandler(url, "dummy task"));
    }

    /**
     * Create a webhook of route /task/:id/hook
     */
    public createHook(taskId: string) : string {
        const hook: string = `http://${this.HOST}:${this.PORT}/task/${taskId}/hook`;
        // console.log(`Hook created: ${hook}`);
        return hook;
    }

    public async taskUpdate(taskId: string | undefined, taskData: any) {
        if (!taskId) {
            console.error(`Task ID is missing: ${taskId}`);
            return;
        }
        // option 1: only update the task status
        const {results, apiResponse, status} = taskData;
        const saveResults = results.map((r: any) => {
            if (r.type === "image-generation") {
                // save image (r.url) to 'public/image' with taskID as file name.
                this.fileService.saveImageFromUrl(r.url, `${taskId}.png`)
                return {
                    type: r.type,
                    url: this.fileService.imageUrl(`${taskId}.png`)
                }
            }
            return r
        })
        if (results) {
            // update task status
            this.tasks.updateOne(
                {_id: taskId},
                {
                    status: status,
                    $push: {results: { $each: saveResults }}
                },
            ).then(() => {
                console.log(`Task ${taskId} updated.`);
                if (apiResponse) {
                    this.openaiResponse.create({
                        taskId: taskId,
                        response: apiResponse
                    });
                }
            }).catch((e) => {
                console.error(`Error while updating Task ${taskId}: ${e}`);
                // todo record this error
            });
        }
        // option 2: push notification to the user
        // TODO：support from client side.
    }
}

export default ThirdPartyAgentService;