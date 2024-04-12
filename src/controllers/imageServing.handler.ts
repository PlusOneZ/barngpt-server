import {NextFunction, Request, Response} from "express";
import ImageService from "../services/image.service";

class ImageServingHandler {
    private imageService = new ImageService();

    public uploadResult = (req: any, res: Response, next: NextFunction) => {
        try {
            const resUrl = this.imageService.imageUrl(req.file!.filename!)
            res.status(201).json({
                message: "Image uploaded",
                data: { url: resUrl }
            });
        } catch (e) {
            next(e)
        }
    }

    public serveImage = (req: Request, res: Response, next: NextFunction) => {
        res.sendFile(
            req.params.filename,
            {root: 'public/images'},
            (err) => {
                res.status(404).json({message: "Image not found."});
            }
        );
    }

    /**
     * Get a list of images, most recent 20 images will be ok.
     * for test.
     */
    public imageList = (req: Request, res: Response, next: NextFunction) => {
        const images = this.imageService.getImageList();
        res.status(200).json({data: images.slice(0, 20), message: "OK"});
    }

    public saveFromUrl = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { url, filename } = req.body;
            this.imageService.saveImageFromUrl(url, filename);
            res.status(201).json({message: "Image saved"});
        } catch (e) {
            // next(e)
        }
    }
}

export default ImageServingHandler;