import multer, { FileFilterCallback } from "multer";
import path from "path";
import HttpException from "../exceptions/HttpException";

function removeUrlEscapes(str: string): string {
    return str.replace(/ +/g, '_')
        .replace(/[\[\]+\-*{}()\/\\]+/g, '')
        .replace(/['"<>|]+/g, '');
}

const imgStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, path.join(__dirname, '../../public/image'))
    },
    filename: function (req: any, file: any, cb: any) {
        const suffix = path.extname(file.originalname);
        cb(null, removeUrlEscapes(path.basename(file.originalname, suffix)) + '-' + Date.now() + suffix)
    }
});

const audioStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, path.join(__dirname, '../../public/audio'))
    },
    filename: function (req: any, file: any, cb: any) {
        const suffix = path.extname(file.originalname);
        cb(null, removeUrlEscapes(path.basename(file.originalname, suffix)) + '-' + Date.now() + suffix)
    }
});

// todo: support not only image file.
// image can be passes with base64 encoding.
const imageFilter = (req: any, file: any, cb: FileFilterCallback) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png)$/)) {
        return cb(new HttpException(400, 'Only image files are allowed!'));
    }
    cb(null, true);
};

const audioFilter = (req: any, file: any, cb: FileFilterCallback) => {
    if (!file.originalname.match(/\.(mp3)$/)) {
        return cb(new HttpException(400, 'Only audio files are allowed!'));
    }
    cb(null, true);
};

const imgUpload = multer({ storage: imgStorage, fileFilter: imageFilter })
const audioUpload = multer({ storage: audioStorage, fileFilter: audioFilter })

export {
    imgUpload,
    audioUpload
}