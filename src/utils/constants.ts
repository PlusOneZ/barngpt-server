const ONE_MILLION = 1000000

const WHISPER_PRICE = 0.006
const TTS_PRICE: any = {
    "tts-1": 15 / ONE_MILLION,
    "tts-1-hd": 30 / ONE_MILLION
}

const SECOND_TO_MINUTE = 60

const MINIMUM_TASKABLE_CREDITS = 0.1

function getWhisperPrice(seconds: number) {
    return WHISPER_PRICE *
        (seconds + 1) / SECOND_TO_MINUTE
}

function getTTSPrice(words: number, model: string) {
    return TTS_PRICE[model] * (words + 1)
}

export {
    getWhisperPrice,
    getTTSPrice,
    MINIMUM_TASKABLE_CREDITS
}