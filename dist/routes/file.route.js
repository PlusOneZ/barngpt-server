"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileServing_handler_1 = __importDefault(require("../controllers/fileServing.handler"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
class FileRoute {
    constructor() {
        this.path = '/file';
        this.router = (0, express_1.Router)();
        this.imageHandler = new fileServing_handler_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/:type/:filename`, this.imageHandler.serveFile);
        this.router.post(`${this.path}/image`, upload_middleware_1.imgUpload.single('image'), this.imageHandler.imgUploadResult);
        this.router.post(`${this.path}/audio`, upload_middleware_1.audioUpload.single('audio'), this.imageHandler.audioUploadResult);
        this.router.get(`${this.path}s`, this.imageHandler.imageList);
        this.router.post(`${this.path}/fromUrl`, this.imageHandler.saveFromUrl);
    }
}
exports.default = FileRoute;
//# sourceMappingURL=file.route.js.map