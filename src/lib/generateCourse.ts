// lib/generateCourse.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Safe parser for Gemini JSON output
function safeParseGeminiJson(text: string) {
  try {
    // Remove Markdown fences if Gemini adds them
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON.parse failed:", err);
    throw err;
  }
}

// Generate a full course object from a given tag/topic, now including FAQs
export async function generateCourseFromTag(tag: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI course generator.
Your task is to generate a complete structured course object in **valid JSON**.
It must strictly follow the schema below (no extra text, only JSON):

{
  "query": "string (the topic, e.g. react)",
  "image": "string (a public URL of a relevant logo/image)",
  "timestamp": "ISO 8601 format",
  "courses": [
    {
      "id": "unique-course-id",
      "title": "Detailed introduction of the course in paragraph form",
      "completed": false,
      "progress": 0.0,
      "lessons": [
        {
          "id": "unique-lesson-id",
          "order": number,
          "lesson": "Lesson Title",
          "explanation": "Detailed explanation of this lesson",
          "completed": false
        }
      ],
      "faqs": [
        {
          "Question": "string",
          "Answer": [
            {"text": "string", "correct": true/false},
            {"text": "string", "correct": true/false},
            {"text": "string", "correct": true/false},
            {"text": "string", "correct": true/false}
          ]
        }
      ]
    }
  ]
}

Rules:
- Create 1 course with 8–10 lessons.
- Query field must exactly be the given tag.
- Title should explain the subject fully (like an intro paragraph).
- Each lesson should be sequential with 'order' starting at 1.
- Explanation should be informative and beginner-friendly.
- Include 5 FAQs for the course.
- Each FAQ should have 1 correct answer and 3 incorrect ones.
- Keep JSON strictly valid (no trailing commas, no markdown).

Tag: "${tag}"
`;

    const result = await model.generateContent(prompt);

    // Try structured response first
    try {
      return safeParseGeminiJson(await result.response.text());
    } catch {
      // Fallback: parse manually
      const text = result.response.text();
      return safeParseGeminiJson(text);
    }
  } catch (error) {
    console.error("⚠️ Gemini course generation error:", error);
    return null;
  }
}
