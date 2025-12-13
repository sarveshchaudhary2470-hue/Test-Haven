const Groq = require("groq-sdk");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function verify() {
    const key = process.env.GROQ_API_KEY;
    if (!key) { console.log("NO KEY"); return; }

    console.log("Testing Groq (Llama-3) with key:", key.substring(0, 8) + "...");
    const groq = new Groq({ apiKey: key });

    const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

    for (const m of models) {
        console.log(`\nTesting ${m}...`);
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Reply strictly with: {\"status\": \"working\"}" }],
                model: m
            });
            console.log("✅ WORKING:", m);
            console.log("Response:", completion.choices[0].message.content);
            return; // Exit on first success
        } catch (error) {
            console.error("❌ FAILED:", m);
            if (error.error) console.error("Details:", error.error);
            else console.error("Error:", error.message);
        }
    }
}
verify();
