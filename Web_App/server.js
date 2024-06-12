const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'hbs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure express-session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to your own secret key
    resave: false,
    saveUninitialized: true
}));

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput, session) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED,
        },
        // ... other safety settings
    ];

    // Retrieve chat history from session or initialize if it doesn't exist
    let chatHistory = session.chatHistory || [];

    if (chatHistory.length === 0) {
        // Add initial prompt message only for new sessions
        chatHistory.push({
        role: "user",
        parts: [{ text: `You are a native Spanish speaker named Enrique from Spain.
        You are a language learner helper who works for Team DEET.
        Your job is to assist the user in any way possible.
        You are only allowed to use very simple Spanish phrases. You need to provide an English translation after each sentence you say in parentheses.
        This is a very casual conversation where your goal is to help the user learn to add words to their vocabulary.`}], // Initial prompt message
        });
    }

    const chat = model.startChat({
        history: chatHistory,
        generationConfig
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;

    // Update chat history in the session
    chatHistory.push({
        role: "user",
        parts: [{ text: userInput }]
    });

    chatHistory.push({
        role: "model",
        parts: [{ text: response.text() }]
    });

    session.chatHistory = chatHistory;

    return response.text();
}

app.get('/', (req, res) => {
    // Clear chat history when accessing the homepage
    req.session.chatHistory = [];
    res.render("index");
});

app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        console.log('incoming /chat req', userInput)
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = await runChat(userInput, req.session);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
