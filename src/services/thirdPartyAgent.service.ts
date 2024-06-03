import {Task, TaskModel} from "../models/task.model";
import axios from "axios";
import dotenv from "dotenv";
import {OpenaiResponseModel} from "../models/openaiResponse.model";
import FileService from "./file.service";
import {composePrompts, removePromptId} from "../utils/prompts";
import AudioService from "./audio.service";


dotenv.config({path: `.env.${process.env.NODE_ENV}`})

class ThirdPartyAgentService {
    public readonly API_URL: string;
    private readonly HOST: string;
    private readonly PORT: string;
    private tasks = TaskModel;
    private openaiResponse = OpenaiResponseModel;
    private fileService = new FileService();
    private audioService = new AudioService();

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
                return this.speechToTextCall(taskId, prompts[0].content)
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

    private async sendImageGenReq(hook: string, data: { image_prompt: string }) {
        // send a image generation request
        const url = this.API_URL + "/task/image/generation"
        axios.post(url, {data: data, hook: hook})
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
        console.log(`Generating audio for task ${taskId}`);
        let results: any[] = [];
        let state;
        let response: any = undefined
        try {
            const rateControl = await axios.post(this.API_URL + "/task/audio/generation");
            if (rateControl.status === 429) {
                console.error("Rate limit reached, try again later.");
                results = [{type: "error", "content": rateControl.data}];
                state = "rejected";
            } else if (rateControl.status === 200) {
                const mp3 = await this.audioService.textToSpeech(text);
                results = mp3 ?
                    [{type: "audio-generation", "url": await this.fileService.saveAudioFile(mp3, taskId)}]
                    : [{type: "error", "content": "Failed to generate audio."}];
                state = mp3 ? "done" : "failed";
                response = mp3;
            }
        } catch (e: any) {
            console.error(`Unexpected response from audio generation: ${e.status}`);
            results = [{type: "error", "content": e.message}];
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
        console.log(`Audio generation for ${taskId} done.`);
    }

    private async speechToTextCall(taskId: string, audioPath: string) {
        console.log(`Recognizing audio for task ${taskId}`)
        const rateControl = await axios.post(this.API_URL + "/task/audio/recognition");
        if (rateControl.status !== 200) {
            console.error("Rate limit reached, try again later.");
            await this.taskUpdate(taskId, { results: [{type: "error", "content": rateControl.data}], status: "rejected"});
            return;
        }
        const audioName = audioPath.split('/').pop();
        try {
            const resp = await this.audioService.speechToText(audioName!);
            const text = resp.text!;
            const results = resp ?
                [{type: "audio-recognition", "text": text}]
                : [{type: "error", "message": "Failed to recognize audio."}];
            await this.taskUpdate(
                taskId,
                {
                    results: results,
                    status: resp ? "done" : "failed",
                    apiResponse: resp
                }
            );
            console.log(`Audio recognition for ${taskId} done.`);
        } catch (e: any) {
            console.error(`Error while recognizing audio ${audioName}: ${e}`);
            await this.taskUpdate(taskId, {
                results: [{type: "error", "message": e.message}],
                status: "rejected"
            });
        }
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
    public createHook(taskId: string): string {
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
                this.fileService.saveImageFromUrl(r.content, `${taskId}.png`)
                return {
                    type: r.type,
                    url: this.fileService.imageUrl(`${taskId}.png`),
                    tokens_used: r.tokens_used
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
                    $push: {results: {$each: saveResults}}
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
            });
        }
        // option 2: push notification to the user
        // TODO：support from client side.
    }
}

export default ThirdPartyAgentService;