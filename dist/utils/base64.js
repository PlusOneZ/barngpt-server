"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageSuffix = exports.getImageMimeType = exports.mimeTypes = void 0;
const base64_1 = require("@waiting/base64");
const logging_1 = require("./logging");
const mimeTypes = {
    png: 'image/png',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    pjpeg: 'image/jpeg',
    pjp: 'image/jpeg',
    jfif: 'image/jpeg'
};
exports.mimeTypes = mimeTypes;
function getImageMimeType(base64Encoded) {
    if (base64Encoded.startsWith('data:')) {
        const found = base64Encoded.match(/data:\S*;base64/g);
        const ret = found && found[0].slice('data:'.length, ';base64'.length * -1);
        // check if ret in mimeTypes values
        return ret && Object.values(mimeTypes).includes(ret) ? ret : null;
    }
    else {
        const prefix = (0, base64_1.b64decode)(base64Encoded.slice(0, 60));
        const found = prefix.match(/(webp)|(png)|(gif)|(svg)|(jpg)|(jpeg)|(pjpeg)|(pjp)|(jfif)/gi);
        if (!found) {
            const hex = Buffer.from(base64Encoded, 'base64').toString('hex');
            if (hex.startsWith('ffd8ff'))
                return mimeTypes.jpeg;
            return null;
        }
        else {
            const type = found[0].toLocaleLowerCase();
            return mimeTypes[type];
        }
    }
}
exports.getImageMimeType = getImageMimeType;
function imageSuffix(mimeType) {
    for (const [key, value] of Object.entries(mimeTypes)) {
        logging_1.log.debug(key, value);
        if (value === mimeType)
            return key;
    }
    return null;
}
exports.imageSuffix = imageSuffix;
//# sourceMappingURL=base64.js.map