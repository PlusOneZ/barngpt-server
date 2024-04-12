import { Prompt } from "../models/task.model";
import HttpException from "../exceptions/HttpException";

export class CreateTaskDto {
    constructor(content_: { prompts: [Prompt] }, type_: string = "dummy", status_: string = "pending") {
        this.content = content_
        this.taskType = type_
        this.status = status_
    }

    public static fromJson(json: any) {
        // read json content and convert to desired form
        if (!("content" in json) || !("prompts" in json.content)) {
            throw new HttpException(400, "Invalid prompt format.");
        }
        const prompts = json.content.prompts.map( (p: any) => {
            if (typeof p === "string") {
                return {role: "user", content: p}
            } else if ("content" in p) {
                return p
            } else {
                throw new HttpException(400, "Invalid prompt format.");
            }
        })

        let tt = this.convertTaskType(json.taskType);
        return new CreateTaskDto({ prompts: prompts }, tt)
    }

    /**
     * taskType should be one of :
     * "dummy", "chat",
     * "image-generation", "image-recognition"
     * "audio-generation", "audio-recognition"
     * this method converts nicknames of types.
     * @param taskType
     * @private
     */
    private static convertTaskType(taskType: string)
        : "dummy" | "chat" |
          "image-generation" | "image-recognition" |
          "audio-generation" | "audio-recognition"
    {
        switch (taskType) {
            case "dummy":
            case "chat":
            case "image-generation":
            case "image-recognition":
            case "audio-generation":
            case "audio-recognition":
                return taskType;
            case "c":
            case "ch":
            case "chat-completion":
                return  "chat";
            case "i":
            case "ig":
            case "image-gen":
                return  "image-generation";
            case "ir":
            case "image-rec":
                return  "image-recognition";
            case "ag":
            case "au":
            case "audio-gen":
                return  "audio-generation";
            case "ar":
            case "audio-rec":
                return "audio-recognition";
            default:
                return "dummy";
        }
    }

    public content : { prompts: [Prompt] };
    public taskType : string;
    public status : string = "pending";
}