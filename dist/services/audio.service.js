"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
class AudioService {
    constructor() {
        this.openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
    }
    textToSpeech(text, model) {
        return this.openai.audio.speech.create({
            model: model,
            voice: "alloy",
            input: text
        });
    }
    speechToText(audioFilename, model) {
        // check if audio file exists
        const apath = path_1.default.join(__dirname, '../../public/audio', audioFilename);
        if (!fs_1.default.existsSync(apath)) {
            throw new Error("Audio file not found.");
        }
        return this.openai.audio.transcriptions.create({
            file: fs_1.default.createReadStream(apath),
            model: model
        });
    }
}
exports.default = AudioService;
//# sourceMappingURL=audio.service.js.map