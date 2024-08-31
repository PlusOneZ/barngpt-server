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

function modelPrices(currency: number) {
    return {
        "gpt-4o-2024-08-06": {
            "input": 2.5 * currency,
            "output": 10. * currency,
            "unit": "per million token"
        },
        "chatgpt-4o-latest": {
            "input": 5. * currency,
            "output": 15. * currency,
            "unit": "per million token"
        },
        "gpt-4o-mini": {
            "input": .15 * currency,
            "output": .60 * currency,
            "unit": "per million token"
        },
        "gpt-3.5-turbo": {
            "input": 0.5 * currency,
            "output": 1.5 * currency,
            "unit": "per million token"
        },
        "gpt-4o": {
            "input": 5. * currency,
            "output": 15. * currency,
            "unit": "per million token"
        },
        "gpt-4-turbo": {
            "input": 10. * currency,
            "output": 30. * currency,
            "unit": "per million token"
        },
        "gpt-4-32k": {
            "input": 60. * currency,
            "output": 120. * currency,
            "unit": "per million token"
        },
        "gpt-4": {
            "input": 30. * currency,
            "output": 60. * currency,
            "unit": "per million token"
        },
        "tts-1": {
            "price": 15 * currency,
            "unit": "per million characters"
        },
        "tts-1-hd": {
            "price": 30 * currency,
            "unit": "per million characters"
        },
        "whisper": {
            "price": 0.006 * currency,
            "unit": "per minute"
        },
        "dall-e-2": {
            "1024x1024":    0.020 * currency,
            "512x512":      0.018 * currency,
            "256x256":      0.016 * currency,
            "unit": "per image"
        },
        "dall-e-3": {
            "1024x1024":    0.040 * currency,
            "1024x1792":    0.080 * currency,
            "1792x1024":    0.080 * currency,
            "unit": "per image"
        }
    }
}

export {
    getWhisperPrice,
    getTTSPrice,
    MINIMUM_TASKABLE_CREDITS,
    modelPrices
}