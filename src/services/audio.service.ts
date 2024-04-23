import OpenAI from 'openai';
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

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

    public speechToText(audioFilename: string) {
        // check if audio file exists
        const apath = path.join(__dirname, '../../public/audio', audioFilename)
        if (!fs.existsSync(apath)) {
            throw new Error("Audio file not found.")
        }
        return this.openai.audio.transcriptions.create({
            file: fs.createReadStream(apath),
            model: "whisper-1"
        })
    }
}

export default AudioService;