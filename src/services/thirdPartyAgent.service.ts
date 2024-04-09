import {TaskModel} from "../models/task.model";
import { post } from "request";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class ThirdPartyAgentService {
    public readonly API_URL: string;
    private readonly HOST: string;
    private readonly PORT: string;
    private tasks = TaskModel;

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
            console.log(`Response from API: ${res}`);
        }
    }

    public async sendChatReq(hook: string, data: {content: string}) {
        // send request to third party agent
        const url = this.API_URL + "/task/chat"
        post(url, {json: {data: data, hook: hook}}, this.responseHandler(url));
    }

    public async sendImageGenReq(hook: string, data: {image_prompt: string}) {
        // send a image generation request
        const url = this.API_URL + "/api/task/image/generation"
        post(url, {json: {data: data, hook: hook}}, this.responseHandler(url))
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
        const {results} = taskData;
        if (results) {
            // update task status
            this.tasks.updateOne(
                {_id: taskId},
                {
                    status: "done",
                    $push: {results: { $each: results }}
                },
            ).then(() => {
                console.log(`Task ${taskId} updated.`);
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