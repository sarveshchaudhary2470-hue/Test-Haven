const Groq = require("groq-sdk");

/**
 * Generate Questions using Groq (Llama-3)
 * @route POST /api/ai/generate-questions
 * @access Private
 */
const generateQuestions = async (req, res) => {
    try {
        const { topic, subject, className, difficulty, count, language } = req.body;

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
            - Language Mode: ${language || 'English'} (Strictly follow this)

            Language Rules:
            1. If "Hindi": All text (questions, options) must be in pure Hindi script (Devanagari).
            2. If "Bilingual": Format as "English Text (Hindi Translation)". Example: "What is Force? (बल क्या है?)" for both question and options.
            3. If "English": Pure English.

            Output Rules:
            1. Return strictly a JSON array of objects. No markdown, no "json" text, no backticks.
            2. Structure: [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0_to_3 }]
            3. Each question MUST have exactly 4 options.
            4. Do not include any explanation or extra text.
            2. GENERATE EXACTLY ${count} QUESTIONS. Do not generate less or more.
            3. Each object must have these exact keys: "question", "options" (array of 4 strings), "correctAnswer" (integer 0-3).
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

            // ENFORCE LIMIT: Slice the array to the requested count to prevent AI hallucinations/over-generation
            if (questions && questions.length > count) {
                questions = questions.slice(0, count);
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

module.exports = { generateQuestions };
