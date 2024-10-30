import {Router} from "express"
import Route from "../interfaces/Route.interface";
import FileServingHandler from "../controllers/fileServing.handler";
import {audioUpload, imgUpload} from "../middlewares/upload.middleware";

import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })


class FileRoute implements Route {
    public path = `${process.env.API_PREFIX || ''}/file`;
    public router = Router();
    public imageHandler = new FileServingHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:type/:filename`, this.imageHandler.serveFile)
        this.router.post(
            `${this.path}/image`,
            imgUpload.single('image'),
            this.imageHandler.imgUploadResult
        );
        this.router.post(
            `${this.path}/audio`,
            audioUpload.single('audio'),
            this.imageHandler.audioUploadResult
        )
        this.router.get(`${this.path}s`, this.imageHandler.imageList);
        this.router.post(`${this.path}/fromUrl`, this.imageHandler.saveFromUrl);
    }
}

export default FileRoute;
