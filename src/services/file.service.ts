import fs from "fs";
import path from "path";
import axios from "axios";

class FileService {
    private readonly HOST: string;
    private readonly PORT: string;

    constructor() {
        this.HOST = process.env.HOST!;
        this.PORT = process.env.PORT!;
    }

    public imageUrl(filename: string) {
        return `${this.HOST}:${this.PORT}/file/image/${filename}`;
    }

    public audioUrl(filename: string) {
        return `${this.HOST}:${this.PORT}/file/audio/${filename}`;
    }

    public imageUrlWithSubDir(subDir: string, filename: string) {
        return `${this.HOST}:${this.PORT}/file/image${subDir}/${filename}`;
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

    public audioPathFromTask(taskId: string) {
        return path.join(__dirname, '../../public/audios', taskId + '.mp3');
    }

    public async saveAudioFile(openaiAudio: any, taskId: string) {
        const buffer = Buffer.from(await openaiAudio.arrayBuffer());
        const stream = fs.createWriteStream(this.audioPathFromTask(taskId));
        stream.write(buffer);
        return this.audioUrl(taskId + '.mp3');
    }
}

export default FileService;