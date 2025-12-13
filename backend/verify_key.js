const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.log("NO KEY FOUND"); return; }
    console.log("Key loaded:", key.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Reply with 'Working'");
        console.log("Response:", result.response.text());
        console.log("SUCCESS: Key is valid!");
    } catch (error) {
        console.error("FAILURE DETAILS:");
        console.error(error.message);
        if (error.response) console.error("Status:", error.response.status);
    }
}
verify();
