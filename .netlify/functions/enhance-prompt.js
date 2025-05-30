// Example Node.js serverless function
const fetch = require('node-fetch'); // Or use Axios, etc.

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { originalPrompt, /* other options */ } = JSON.parse(event.body);
        const geminiApiKey = process.env.GEMINI_API_KEY; // Key stored as environment variable

        // Construct your actual prompt to Gemini API based on 'originalPrompt' and 'other options'
        const apiUserPromptForGemini = `Enhance this: ${originalPrompt} ...`; // Simplified

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: apiUserPromptForGemini }] }] })
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            console.error("Gemini API Error:", errorData);
            return { statusCode: geminiResponse.status, body: JSON.stringify({ error: "Failed to fetch from Gemini API", details: errorData }) };
        }

        const data = await geminiResponse.json();
        // Extract the relevant part from Gemini's response
        const enhancedText = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ enhancedPrompt: enhancedText })
        };
    } catch (error) {
        console.error("Proxy Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error in proxy", details: error.message })
        };
    }
};