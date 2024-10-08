import fs from "fs";
import path from "path";
import axios from "axios";
import { getAudioDurationInSeconds } from 'get-audio-duration'
import  {getImageMimeType, imageSuffix} from "../utils/base64";

import { log } from "../utils/logging";

class FileService {
    // private readonly HOST: string;
    // private readonly PORT: string;
    private readonly HOST_URL: string;

    constructor() {
        // this.HOST = process.env.HOST!;
        // this.PORT = process.env.PORT!;
        this.HOST_URL = process.env.HOST_URL!;
    }

    public imageUrl(filename: string) {
        return `${this.HOST_URL}/file/image/${filename}`;
    }

    public audioUrl(filename: string) {
        return `${this.HOST_URL}/file/audio/${filename}`;
    }

    public imageUrlWithSubDir(subDir: string, filename: string) {
        return `${this.HOST_URL}/file/image${subDir}/${filename}`;
    }

    public getImageList() {
        return fs.readdirSync(path.join(__dirname, '../../public/image'))
            .map((f) => this.imageUrl(f));
    }

    public getAudioList() {
        return fs.readdirSync(path.join(__dirname, '../../public/audio'))
            .map((f) => this.audioUrl(f));
    }

    public saveImageFromUrl(url: string, filename: string, subDir: string = "") {
        if (url.startsWith('file://')) {
            return this.saveImageFileFromLocal(url.slice('file://'.length), filename, subDir);
        }
        const saveName = `${filename}.png`
        const stream = fs.createWriteStream(
            path.join(__dirname, '../../public/image' + subDir, saveName),
        );
        stream.on('open', () => {
            axios({
                url,
                method: 'GET',
                responseType: 'stream'
            }).then((response) => {
                response.data.pipe(stream);
            });
        })
        return saveName
    }

    private saveImageFileFromLocal(filePath: string, filename: string, subDir: string = "") {
        const subfix = path.extname(filePath);
        const saveName = `${filename}${subfix}`;
        fs.copyFileSync(
            filePath,
            path.join(__dirname, '../../public/image' + subDir, saveName)
        );
        return saveName;
    }

    public base64ImageToFile(base64: string, filename: string) {
        // split from comma to get last part as file content
        const mimeType = getImageMimeType(base64);
        if (!mimeType) {
            return false
        }
        const suffix = imageSuffix(mimeType);
        if (!suffix) {
            return false
        }
        filename = filename + "." + suffix;
        const parts = base64.split(',');
        let fileContent = parts[parts.length - 1];
        fileContent = fileContent.replace(
            /dataimage\/((jpeg)|(png)|(jpg)|(gif)|(webp)|(svg))base64/,
            ''
        )
        const buffer = Buffer.from(fileContent, 'base64');
        fs.writeFileSync(
            path.join(__dirname, '../../public/image', filename),
            buffer
        );
        return this.imageUrl(filename);
    }

    public audioPathFromTask(taskId: string) {
        return path.join(__dirname, '../../public/audio', taskId + '.mp3');
    }

    public async saveAudioFile(openaiAudio: any, taskId: string) {
        const buffer = Buffer.from(await openaiAudio.arrayBuffer());
        await fs.promises.writeFile(
            this.audioPathFromTask(taskId),
            buffer
        )
        return this.audioUrl(taskId + '.mp3');
    }

    public async getAudioDuration(audioName: string) {
        try {
            const audioPath = path.join(__dirname, '../../public/audio', audioName)
            return await getAudioDurationInSeconds(audioPath);
        } catch (e) {
            log.error(`Error while getting audio duration: ${e}`);
            return -0.1;
        }
    }
}

export default FileService;