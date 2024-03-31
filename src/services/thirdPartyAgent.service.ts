import {TaskModel} from "../models/task.model";


class ThirdPartyAgentService {
    public readonly API_URL: string | undefined;
    private readonly HOST: string | undefined;
    private readonly PORT: string | undefined;
    private tasks = TaskModel;

    constructor() {
        this.API_URL = process.env.THIRD_PARTY_AGENT_API;
        this.HOST = process.env.HOST;
        this.PORT = process.env.PORT;

        if (!this.API_URL) {
            console.error("API URL is missing.");
            process.exit(1);
        }
    }

    public async sendReq(hook: string, data: any) {

    }

    public createHook(taskId: string) : string {
        const hook: string = `http://${this.HOST}:${this.PORT}/task/${taskId}/hook`;
        console.log(`Hook created: ${hook}`);
        return hook;
    }

    public async taskUpdate(taskId: string | undefined, taskData: any) {
        if (!taskId) {
            console.error("Task ID is missing.");
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
            });
        }
        // option 2: push notification to the user
        // TODO：support from client side.
    }
}

export default ThirdPartyAgentService;