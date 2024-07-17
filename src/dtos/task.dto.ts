import { Prompt } from "../models/task.model";
import HttpException from "../exceptions/HttpException";

export class CreateTaskDto {
    constructor(content_: { prompts: [Prompt] }, type_: string = "dummy", model_: string = "default", status_: string = "pending") {
        this.content = content_
        this.taskType = type_
        this.model = model_
        this.status = status_
        this.deferModel()
    }

    public content : { prompts: [Prompt] };
    public taskType : string;
    public status : string = "pending";
    public model : string;

    public static defaultModelMap: any = {
        "chat": "gpt-3.5-turbo",
        "image-generation": "dall-e-2",
        "image-recognition": "gpt-4o",
        "audio-generation": "tts-1",
        "audio-recognition": "whisper-1"
    }

    private deferModel() {
        if (this.model === "default") {
            this.model = CreateTaskDto.defaultModelMap[this.taskType]
        }
    }

    public static fromJson(json: any) {
        // read json content and convert to desired form
        try {
            var _ = !("content" in json) || !("prompts" in json.content)
            if (_) throw new Error()
        } catch (e) {
            throw new HttpException(400, "Invalid prompt format.");
        }
        const prompts = json.content.prompts.map( (p: any) => {
            if (typeof p === "string") {
                return {role: "user", content: p}
            } else {
                try {
                    if ("content" in p) return p
                } catch (e) {
                    throw new HttpException(400, "Invalid prompt format.");
                }
            }
        })

        return new CreateTaskDto({ prompts: prompts }, json.taskType, json.model)
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
    public static convertTaskType(taskType: string)
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
}