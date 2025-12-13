const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    const modelName = "gemini-2.0-flash-001";

    console.log(`Testing ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Reply with 'Success'");
        console.log("Response:", result.response.text());
        console.log("✅ WORKING");
    } catch (error) {
        console.error("❌ FAILED:", error.message);
    }
}
verify();
