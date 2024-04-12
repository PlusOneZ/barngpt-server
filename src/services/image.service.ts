import fs from "fs";
import path from "path";
import axios from "axios";

class ImageService {
    private readonly HOST: string;
    private readonly PORT: string;

    constructor() {
        this.HOST = process.env.HOST!;
        this.PORT = process.env.PORT!;
    }

    public imageUrl(filename: string) {
        return `${this.HOST}:${this.PORT}/image/${filename}`;
    }

    public imageUrlWithSubDir(subDir: string, filename: string) {
        return `${this.HOST}:${this.PORT}/image${subDir}/${filename}`;
    }

    public getImageList() {
        return fs.readdirSync(path.join(__dirname, '../../public/images'))
            .map((f) => this.imageUrl(f));
    }

    public saveImageFromUrl(url: string, filename: string, subDir: string = "") {
        const stream = fs.createWriteStream(
            path.join(__dirname, '../../public/images' + subDir, filename),
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
}

export default ImageService;