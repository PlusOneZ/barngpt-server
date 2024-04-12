import multer, { FileFilterCallback } from "multer";
import path from "path";
import HttpException from "../exceptions/HttpException";

const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, path.join(__dirname, '../../public/images'))
    },
    filename: function (req: any, file: any, cb: any) {
        const suff = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, suff) + '-' + Date.now() + suff)
    }
});

const imageFilter = (req: any, file: any, cb: FileFilterCallback) => {
    if (!file.originalname.match(/\.(JPG|jpg|jpeg|png)$/)) {
        return cb(new HttpException(400, 'Only image files are allowed!'));
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter })

export {
    upload
}