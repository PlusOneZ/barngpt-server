import { b64decode } from '@waiting/base64'

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
}

function getImageMimeType(base64Encoded: string) {
    if (base64Encoded.startsWith('data:')) {
        const found = base64Encoded.match(/data:\S*;base64/g)
        const ret =  found && found[0].slice('data:'.length, ';base64'.length * -1)
        // check if ret in mimeTypes values
        return ret && Object.values(mimeTypes).includes(ret) ? ret : null
    } else {
        const prefix = b64decode(base64Encoded.slice(0, 60))
        const found = prefix.match(/(webp)|(png)|(gif)|(svg)|(jpg)|(jpeg)|(pjpeg)|(pjp)|(jfif)/gi)
        if (!found) {
            const hex = Buffer.from(base64Encoded, 'base64').toString('hex')
            if (hex.startsWith('ffd8ff')) return mimeTypes.jpeg
            return null
        } else {
            const type : string = found[0].toLocaleLowerCase()
            return (mimeTypes as any)[type]
        }
    }
}

function imageSuffix(mimeType: string) {
    for (const [key, value] of Object.entries(mimeTypes)) {
        console.log(key, value)
        if (value === mimeType) return key
    }
    return null
}

export {
    mimeTypes,
    getImageMimeType,
    imageSuffix
}