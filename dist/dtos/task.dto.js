"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskDto = void 0;
const bson_1 = require("bson");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class CreateTaskDto {
    constructor(content_, type_ = "dummy", model_ = "default", options = undefined, status_ = "pending") {
        this.status = "pending";
        this.content = content_;
        this.taskType = type_;
        this.model = model_;
        this.status = status_;
        this.deferModel();
        this.options = options;
    }
    setOwner(_id) {
        this.ownerId = new bson_1.ObjectId(_id);
    }
    deferModel() {
        if (this.model === "default") {
            this.model = CreateTaskDto.defaultModelMap[this.taskType];
        }
    }
    static fromJson(json) {
        // read json content and convert to desired form
        try {
            var _ = !("content" in json) || !("prompts" in json.content);
            if (_)
                throw new Error();
        }
        catch (e) {
            throw new HttpException_1.default(400, "Invalid prompt format.");
        }
        const prompts = json.content.prompts.map((p) => {
            if (typeof p === "string") {
                return { role: "user", content: p };
            }
            else {
                try {
                    if ("content" in p)
                        return p;
                }
                catch (e) {
                    throw new HttpException_1.default(400, "Invalid prompt format.");
                }
            }
        });
        return new CreateTaskDto({ prompts: prompts }, json.taskType, json.model, json.options);
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
    static convertTaskType(taskType) {
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
                return "chat";
            case "i":
            case "ig":
            case "image-gen":
                return "image-generation";
            case "ir":
            case "image-rec":
                return "image-recognition";
            case "ag":
            case "au":
            case "audio-gen":
                return "audio-generation";
            case "ar":
            case "audio-rec":
                return "audio-recognition";
            default:
                return "dummy";
        }
    }
}
exports.CreateTaskDto = CreateTaskDto;
CreateTaskDto.defaultModelMap = {
    "chat": "gpt-4o-mini",
    "image-generation": "dall-e-2",
    "image-recognition": "gpt-4o-2024-08-06",
    "audio-generation": "tts-1",
    "audio-recognition": "whisper-1"
};
//# sourceMappingURL=task.dto.js.map