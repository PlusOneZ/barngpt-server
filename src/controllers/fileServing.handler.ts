import {NextFunction, Request, Response} from "express";
import FileService from "../services/file.service";
import HttpException from "../exceptions/HttpException";
import path from "path";
import { log } from "../utils/logging";

class FileServingHandler {
    private fileService = new FileService();

    public imgUploadResult = (req: any, res: Response, next: NextFunction) => {
        try {
            const resUrl = this.fileService.imageUrl(req.file!.filename!)
            res.status(201).json({
                message: "Image uploaded",
                data: { url: resUrl }
            });
        } catch (e) {
            next(e)
        }
    }

    public audioUploadResult = (req: any, res: Response, next: NextFunction) => {
        try {
            const resUrl = this.fileService.audioUrl(req.file!.filename!)
            res.status(201).json({
                message: "Audio uploaded",
                data: { url: resUrl }
            });
        } catch (e) {
            next(e)
        }
    }

    public serveFile = (req: Request, res: Response, next: NextFunction) => {
        log.info("Retrieving File", req.params.filename, req.params.type)
        res.sendFile(
            req.params.filename,
            {root: path.join(__dirname, '../../public', req.params.type)},
            (err) => {
                if (err) {
                    next(new HttpException(404, "File not found."))
                }
            }
        );
    }

    /**
     * Get a list of image, most recent 20 image will be ok.
     * for test.
     */
    public imageList = (req: Request, res: Response, next: NextFunction) => {
        const images = this.fileService.getImageList();
        res.status(200).json({data: images.slice(0, 20), message: "OK"});
    }

    public saveFromUrl = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { url, filename } = req.body;
            this.fileService.saveImageFromUrl(url, filename);
            res.status(201).json({message: "Image saved"});
        } catch (e) {
            // next(e)
        }
    }
}

export default FileServingHandler;