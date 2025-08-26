

import { GoogleGenAI } from "@google/genai";
import { Transcription } from "../types";

// FIX: Check for API_KEY and initialize GoogleGenAI directly with process.env.API_KEY as per the coding guidelines.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSegmentContent = async (
    transcription: Transcription,
    segmentPrompt: string
): Promise<string> => {
    try {
        // FIX: Refactored prompt to use systemInstruction for better structure and clarity, following Gemini API best practices.
        const systemInstruction = `Eres un asistente experto en la redacción de actas de reunión.
A continuación se te proporciona una transcripción de una reunión en formato JSON.
Tu tarea es analizar esta transcripción y generar el contenido para un segmento específico del acta de reunión basado en la instrucción proporcionada.
Responde únicamente con el contenido solicitado, sin añadir introducciones o conclusiones adicionales.
Formatea tu respuesta usando Markdown para una mejor legibilidad (listas, negritas, etc.).`;

        const userPrompt = `**INSTRUCCIÓN DEL SEGMENTO:**
${segmentPrompt}

**TRANSCRIPCIÓN DE LA REUNIÓN (JSON):**
${JSON.stringify(transcription, null, 2)}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                temperature: 0.3,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("La API de Gemini no devolvió contenido.");
        }
        return text;

    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        throw new Error("No se pudo generar el contenido del segmento. Por favor, inténtelo de nuevo.");
    }
};
