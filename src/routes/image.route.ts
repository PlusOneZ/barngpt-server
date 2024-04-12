import {Router} from "express"
import Route from "../interfaces/Route.interface";
import ImageServingHandler from "../controllers/imageServing.handler";
import {upload} from "../middlewares/image.middleware";

class ImageRoute implements Route {
    public path = '/image';
    public router = Router();
    public imageHandler = new ImageServingHandler();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/:filename`, this.imageHandler.serveImage)
        this.router.post(
            `${this.path}`,
            upload.single('image'),
            this.imageHandler.uploadResult
        );
        this.router.get(`${this.path}s`, this.imageHandler.imageList);
        this.router.post(`${this.path}/fromUrl`, this.imageHandler.saveFromUrl);
    }
}

export default ImageRoute;