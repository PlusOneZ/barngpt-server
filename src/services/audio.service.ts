import OpenAI from 'openai';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

class AudioService {
    private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    public textToSpeech(text: string) {
        return this.openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text
        })
    }

    public speechToText(audioPath: string) {
        return this.openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1"
        })
    }
}

export default AudioService;