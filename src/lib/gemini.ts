// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Ask Gemini with context
export async function askGemini(question: string, context: any) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an AI teaching assistant. 
Only answer questions related to the current course query: "${context.query}".
If the question is unrelated, politely say you can only help with ${context.query}.
Use the course context below to give updated, reliable answers.

Course Context:
${JSON.stringify(context.courses, null, 2)}

User Question: ${question}
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini error:", error);
        return "Sorry, I couldn’t fetch an answer right now.";
    }
}
