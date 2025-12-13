const Groq = require("groq-sdk");

/**
 * Generate Questions using Groq (Llama-3)
 * @route POST /api/ai/generate-questions
 * @access Private
 */
const generateQuestions = async (req, res) => {
    try {
        const { topic, subject, className, difficulty, count } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Groq API Key is not configured in the server."
            });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5
        });

        const text = completion.choices[0]?.message?.content || "";
        console.log("Groq Raw Answer:", text);

        let questions;
        try {
            // Llama 3 with JSON mode usually returns an object like { "questions": [...] } or just the array.
            // We need to be careful. The prompt asked for an array, but json_object mode enforces VALID JSON.
            // Sometimes it wraps it. Let's try to parse directly.
            const parsed = JSON.parse(text);

            if (Array.isArray(parsed)) {
                questions = parsed;
            } else if (parsed.questions && Array.isArray(parsed.questions)) {
                questions = parsed.questions;
            } else {
                // Determine if it's a wrapped object with a random key
                const keys = Object.keys(parsed);
                if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
                    questions = parsed[keys[0]];
                } else {
                    throw new Error("Could not find array in JSON response");
                }
            }

        } catch (parseError) {
            console.error("Groq JSON Parse Error:", parseError);
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
        console.error("Groq Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate questions. " + error.message
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
        if (!process.env.GROQ_API_KEY) throw new Error("Groq API Key missing");

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7
        });

        const text = completion.choices[0]?.message?.content || "";
        const parsed = JSON.parse(text);

        // Handle array or wrapped array
        if (Array.isArray(parsed)) return parsed;
        const keys = Object.keys(parsed);
        if (keys.length === 1 && Array.isArray(parsed[keys[0]])) return parsed[keys[0]];

        return [];

    } catch (error) {
        console.error("Battle AI Error:", error);
        return [];
    }
};

module.exports = { generateQuestions, generateBattleQuestions };
