import { NextApiRequest, NextApiResponse } from "next";
import { ClientOptions, OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
    apiKey: apiKey,
} as ClientOptions);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("Request body:", req.body);
    if (req.method === 'POST') {
        try {
            interface RequestBody {
                text: string;
            }

            const { text } = req.body as RequestBody;
            const response = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text,
            });

            const audioBuffer = Buffer.from(await response.arrayBuffer());
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.send(audioBuffer);
        } catch (error) {
            console.error("Error in text-to-speech conversion:", error);
            return res.status(500).json({ error: "Failed to convert text to speech." });
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
