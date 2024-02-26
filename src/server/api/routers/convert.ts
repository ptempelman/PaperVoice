

import { TRPCError } from "@trpc/server";
import { ClientOptions, OpenAI } from "openai";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

const openai = new OpenAI({
    apiKey: apiKey,
} as ClientOptions);

export const convertRouter = createTRPCRouter({
    convertTextToSpeech: publicProcedure
        .input(z.object({
            text: z.string(),
        }))
        .mutation(async ({ input }) => {
            try {
                const response = await openai.audio.speech.create({
                    model: "tts-1",
                    voice: "alloy",
                    input: input.text,
                });


                const audioBuffer = Buffer.from(await response.arrayBuffer());
                // Encode the buffer as a Base64 string to ensure compatibility with JSON
                const base64Audio = audioBuffer.toString('base64');

                // Return the Base64-encoded string
                return { audio: base64Audio };
            } catch (error) {
                console.error("Error in text-to-speech conversion:", error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to convert text to speech',
                });
            }
        }),
});