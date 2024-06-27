
const WHISPER_PRICE = 0.006
const TTS_PRICE = 15

const ONE_MILLION = 1000000
const SECOND_TO_MINUTE = 60
const USD_TO_CNY_CURRENCY = 10.

function getWhisperPrice(seconds: number) {
    return WHISPER_PRICE *
        (seconds + 1) / SECOND_TO_MINUTE *
        USD_TO_CNY_CURRENCY
}

function getTTSPrice(words: number) {
    return TTS_PRICE *
        (words + 1) / ONE_MILLION *
        USD_TO_CNY_CURRENCY
}

export {
    getWhisperPrice,
    getTTSPrice
}