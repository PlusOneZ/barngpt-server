"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const get_audio_duration_1 = require("get-audio-duration");
const base64_1 = require("../utils/base64");
const logging_1 = require("../utils/logging");
class FileService {
    constructor() {
        // this.HOST = process.env.HOST!;
        // this.PORT = process.env.PORT!;
        this.HOST_URL = process.env.HOST_URL;
    }
    imageUrl(filename) {
        return `${this.HOST_URL}/file/image/${filename}`;
    }
    audioUrl(filename) {
        return `${this.HOST_URL}/file/audio/${filename}`;
    }
    imageUrlWithSubDir(subDir, filename) {
        return `${this.HOST_URL}/file/image${subDir}/${filename}`;
    }
    getImageList() {
        return fs_1.default.readdirSync(path_1.default.join(__dirname, '../../public/image'))
            .map((f) => this.imageUrl(f));
    }
    getAudioList() {
        return fs_1.default.readdirSync(path_1.default.join(__dirname, '../../public/audio'))
            .map((f) => this.audioUrl(f));
    }
    saveImageFromUrl(url, filename, subDir = "") {
        const stream = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../../public/image' + subDir, filename));
        stream.on('open', () => {
            (0, axios_1.default)({
                url,
                method: 'GET',
                responseType: 'stream'
            }).then((response) => {
                response.data.pipe(stream);
            });
        });
    }
    base64ImageToFile(base64, filename) {
        // split from comma to get last part as file content
        const mimeType = (0, base64_1.getImageMimeType)(base64);
        if (!mimeType) {
            return false;
        }
        const suffix = (0, base64_1.imageSuffix)(mimeType);
        if (!suffix) {
            return false;
        }
        filename = filename + "." + suffix;
        const parts = base64.split(',');
        let fileContent = parts[parts.length - 1];
        fileContent = fileContent.replace(/dataimage\/((jpeg)|(png)|(jpg)|(gif)|(webp)|(svg))base64/, '');
        const buffer = Buffer.from(fileContent, 'base64');
        fs_1.default.writeFileSync(path_1.default.join(__dirname, '../../public/image', filename), buffer);
        return this.imageUrl(filename);
    }
    audioPathFromTask(taskId) {
        return path_1.default.join(__dirname, '../../public/audio', taskId + '.mp3');
    }
    async saveAudioFile(openaiAudio, taskId) {
        const buffer = Buffer.from(await openaiAudio.arrayBuffer());
        await fs_1.default.promises.writeFile(this.audioPathFromTask(taskId), buffer);
        return this.audioUrl(taskId + '.mp3');
    }
    async getAudioDuration(audioName) {
        try {
            const audioPath = path_1.default.join(__dirname, '../../public/audio', audioName);
            return await (0, get_audio_duration_1.getAudioDurationInSeconds)(audioPath);
        }
        catch (e) {
            logging_1.log.error(`Error while getting audio duration: ${e}`);
            return -0.1;
        }
    }
}
exports.default = FileService;
//# sourceMappingURL=file.service.js.map