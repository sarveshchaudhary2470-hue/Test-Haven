const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate Questions using Gemini AI
 * @route POST /api/ai/generate-questions
 * @access Private
 */
const generateQuestions = async (req, res) => {
    try {
        const { topic, subject, className, difficulty, count } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API Key is not configured in the server."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Strict Prompt Engineering ensures valid JSON output
        const prompt = `
            Act as a strict teacher data generator.
            Generate ${count} multiple choice questions for specific details below:
            - Subject: ${subject}
            - Topic: ${topic}
            - Class: ${className}
            - Difficulty: ${difficulty}
            - Language: English

            Output Rules:
            1. Return strictly a JSON array of objects. No markdown, no "json" text, no backticks.
            2. Each object must have these exact keys: "question", "options" (array of 4 strings), "correctAnswer" (integer 0-3).
            3. "correctAnswer" must be the index of the correct option (0 for A, 1 for B, etc.).
            4. Ensure options are distinct.
            
            Example Format:
            [
                {
                    "question": "What is the unit of Force?",
                    "options": ["Joule", "Newton", "Watt", "Pascal"],
                    "correctAnswer": 1
                }
            ]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response (remove potential markdown code blocks)
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let questions;
        try {
            questions = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", parseError, "Raw Text:", text);
            return res.status(500).json({
                success: false,
                message: "AI generated invalid data format. Please try again."
            });
        }

        res.status(200).json({
            success: true,
            data: questions
        });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate questions. " + (error.message || "")
        });
    }
};

/**
 * Generate Rapid Battle Questions for 1v1 Arena
 * @input className, subject (optional)
 * @returns 20 Questions JSON
 */
const generateBattleQuestions = async (className) => {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API Key missing");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Act as a Quiz Master for a 1v1 Battle Arena.
            Generate 20 Short & Tricky Multiple Choice Questions for Class ${className} students.
            Mix subjects: Science (6), Math (6), General Knowledge (4), English (4).

            Rules:
            1. Questions must be ONE LINE only (for fast reading).
            2. Options must be short (1-3 words).
            3. Return strictly a JSON array.
            4. JSON Keys: "question", "options" (4 strings), "correctAnswer" (0-3).
            
            Example: [{"question":"Capital of India?","options":["Delhi","Mumbai","Goa","Pune"],"correctAnswer":0}]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("Battle AI Error:", error);
        return [];
    }
};

module.exports = { generateQuestions, generateBattleQuestions };
