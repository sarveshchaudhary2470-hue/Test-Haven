const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.log("ERROR: No GEMINI_API_KEY found in .env");
    process.exit(1);
}
console.log("Using Key:", key.slice(0, 10) + "...");

async function check(modelName) {
    process.stdout.write(`Testing ${modelName.padEnd(20)}: `);
    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        const response = await result.response;
        console.log("✅ WORKING");
        return true;
    } catch (e) {
        console.log(`❌ FAILED (${e.message.split('\n')[0]})`);
        if (e.message.includes("403")) console.log("   -> NOTE: 403 usually means API not enabled in Google Cloud Console.");
        if (e.message.includes("404")) console.log("   -> NOTE: 404 usually means Model Name invalid or Key has no access.");
        return false;
    }
}

async function run() {
    console.log("\n--- STARTING DIAGNOSIS ---");
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-pro",
        "gemini-1.0-pro"
    ];

    for (const m of models) {
        await check(m);
    }
    console.log("--- DIAGNOSIS COMPLETE ---\n");
}
run();
