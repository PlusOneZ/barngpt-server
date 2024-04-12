import {Task, TaskModel} from "../models/task.model";
import { post } from "request";
import dotenv from "dotenv";
import {OpenaiResponseModel} from "../models/openaiResponse.model";
import ImageService from "./image.service";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class ThirdPartyAgentService {
    public readonly API_URL: string;
    private readonly HOST: string;
    private readonly PORT: string;
    private tasks = TaskModel;
    private openaiResponse = OpenaiResponseModel;
    private imageService = new ImageService();

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
        return (err: any, res: any, body: any) => {
            if (err) {
                console.error(`Error while sending request to ${url}: ${err}`);
                // todo: add to records
            }
            console.log(`Response from API: ${body}`);
        }
    }

    public async doTask(taskData: Task) {
        const hook = this.createHook(taskData._id.toString());
        if (taskData.taskType === "chat") {
            return this.sendChatReq(hook, taskData.content.prompts);
        } else if (taskData.taskType === "image-generation") {
            return this.sendImageGenReq(
                hook,
                {
                    image_prompt:
                        ThirdPartyAgentService.composeImagePrompts(taskData.content.prompts)
                });
        } else {
            // dummy task
            return this.sendDummyReq(hook);
        }
    }

    private static composeImagePrompts(prompts: any) : string {
        return prompts.reduce((prompt : string, v: any) => {
            return prompt + (v.role === "user") ? v.content : ""
        }, "")
    }

    private async sendChatReq(hook: string, prompts: any) {
        // send request to third party agent
        const url = this.API_URL + "/task/chat"
        post(url, {json: {data: prompts, hook: hook}}, this.responseHandler(url));
    }

    private async sendImageGenReq(hook: string, data: {image_prompt: string}) {
        // send a image generation request
        const url = this.API_URL + "/task/image/generation"
        post(url, {json: {data: data, hook: hook}}, this.responseHandler(url))
    }

    private async sendDummyReq(hook: string) {
        // send a dummy request
        const url = this.API_URL
        post(url, {json: {hook: hook}}, this.responseHandler(url))
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
                // save image (r.url) to 'public/images' with taskID as file name.
                this.imageService.saveImageFromUrl(r.url, `${taskId}.png`, "/generated")
                return {
                    type: r.type,
                    url: this.imageService.imageUrlWithSubDir("/generated", `${taskId}.png`)
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