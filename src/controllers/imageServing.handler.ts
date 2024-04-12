import { static as staticPath } from 'express';
import { Request, Response, NextFunction } from "express";


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
        try {
            res.sendFile(req.params.filename, { root: 'public/images' });
        } catch (e) {
            next(e)
        }
    }
}

export default ImageServingHandler;