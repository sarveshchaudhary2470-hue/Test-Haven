const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;
if (!key) { console.log("NO KEY"); process.exit(1); }

async function listModels() {
    console.log("Querying Google API directly via REST...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log("✅ API CONNECTED. Models available:");
        const models = response.data.models;
        if (models && models.length > 0) {
            models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(` - ${m.name.replace('models/', '')}`);
                }
            });
        } else {
            console.log("WARNING: API returned 200 but 0 models found.");
        }
    } catch (error) {
        console.log("❌ REQUEST FAILED");
        if (error.response) {
            console.log(`Status: ${error.response.status} ${error.response.statusText}`);
            console.log("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error:", error.message);
        }
    }
}
listModels();
