import fs from "fs";
import path from "path";
import axios from "axios";
import { getAudioDurationInSeconds } from 'get-audio-duration'

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
        const stream = fs.createWriteStream(
            path.join(__dirname, '../../public/image' + subDir, filename),
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
    }

    public base64ImageToFile(base64: string, filename: string) {
        const file_content = base64.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(file_content, 'base64');
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
            console.error(`Error while getting audio duration: ${e}`);
            return -0.1;
        }
    }
}

export default FileService;