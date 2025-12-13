const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.log("NO KEY"); return; }

    console.log("Testing gemini-1.5-flash-001 with key:", key.substring(0, 8) + "...");
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    try {
        const result = await model.generateContent("Reply with 'Success'");
        console.log("Response:", result.response.text());
        console.log("✅ MODEL WORKING LOCALLY");
    } catch (error) {
        console.error("❌ FAILED:", error.message);
    }
}
verify();
