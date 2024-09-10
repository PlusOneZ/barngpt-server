"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const file_service_1 = __importDefault(require("../services/file.service"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const path_1 = __importDefault(require("path"));
const logging_1 = require("../utils/logging");
class FileServingHandler {
    constructor() {
        this.fileService = new file_service_1.default();
        this.imgUploadResult = (req, res, next) => {
            try {
                const resUrl = this.fileService.imageUrl(req.file.filename);
                res.status(201).json({
                    message: "Image uploaded",
                    data: { url: resUrl }
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.audioUploadResult = (req, res, next) => {
            try {
                const resUrl = this.fileService.audioUrl(req.file.filename);
                res.status(201).json({
                    message: "Audio uploaded",
                    data: { url: resUrl }
                });
            }
            catch (e) {
                next(e);
            }
        };
        this.serveFile = (req, res, next) => {
            logging_1.log.info("Retrieving File", req.params.filename, req.params.type);
            res.sendFile(req.params.filename, { root: path_1.default.join(__dirname, '../../public', req.params.type) }, (err) => {
                if (err) {
                    next(new HttpException_1.default(404, "File not found."));
                }
            });
        };
        /**
         * Get a list of image, most recent 20 image will be ok.
         * for test.
         */
        this.imageList = (req, res, next) => {
            const images = this.fileService.getImageList();
            res.status(200).json({ data: images.slice(0, 20), message: "OK" });
        };
        this.saveFromUrl = (req, res, next) => {
            try {
                const { url, filename } = req.body;
                this.fileService.saveImageFromUrl(url, filename);
                res.status(201).json({ message: "Image saved" });
            }
            catch (e) {
                // next(e)
            }
        };
    }
}
exports.default = FileServingHandler;
//# sourceMappingURL=fileServing.handler.js.map