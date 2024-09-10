"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioUpload = exports.imgUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
function removeUrlEscapes(str) {
    return str.replace(/ +/g, '_')
        .replace(/[\[\]+\-*{}()\/\\]+/g, '')
        .replace(/['"<>|]+/g, '');
}
const imgStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, '../../public/image'));
    },
    filename: function (req, file, cb) {
        const suffix = path_1.default.extname(file.originalname);
        cb(null, removeUrlEscapes(path_1.default.basename(file.originalname, suffix)) + '-' + Date.now() + suffix);
    }
});
const audioStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, '../../public/audio'));
    },
    filename: function (req, file, cb) {
        const suffix = path_1.default.extname(file.originalname);
        cb(null, removeUrlEscapes(path_1.default.basename(file.originalname, suffix)) + '-' + Date.now() + suffix);
    }
});
// todo: support not only image file.
// image can be passes with base64 encoding.
const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png)$/)) {
        return cb(new HttpException_1.default(400, 'Only image files are allowed!'));
    }
    cb(null, true);
};
const audioFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(mp3)$/)) {
        return cb(new HttpException_1.default(400, 'Only audio files are allowed!'));
    }
    cb(null, true);
};
const imgUpload = (0, multer_1.default)({ storage: imgStorage, fileFilter: imageFilter });
exports.imgUpload = imgUpload;
const audioUpload = (0, multer_1.default)({ storage: audioStorage, fileFilter: audioFilter });
exports.audioUpload = audioUpload;
//# sourceMappingURL=upload.middleware.js.map