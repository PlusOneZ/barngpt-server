import {NextFunction, Request, Response} from "express";
import * as fs from "fs";
import path from "path";

class ImageServingHandler {
    public uploadResult = (req: any, res: Response, next: NextFunction) => {
        try {
            const res_url = `${req.protocol}://${req.get('host')}/image/${req.file!.filename!}`;
            res.status(201).json({
                message: "Image uploaded",
                data: {
                    url: res_url
                }
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
     * @param req
     * @param res
     * @param next
     */
    public imageList = (req: Request, res: Response, next: NextFunction) => {
        const images = fs.readdirSync(path.join(__dirname, '../../public/images'))
            .map((f) => `${req.protocol}://${req.get('host')}/image/${f}`);
        res.status(200).json({data: images.slice(0, 20), message: "OK"});
    }
}

export default ImageServingHandler;