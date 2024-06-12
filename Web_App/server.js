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
        parts: [{ text: `You are a music tutor helping the user have fun while practicing piano.`}], // Initial prompt message
        });
    }
//        This is a casual conversation where your goal is to help the user practice and improve their skills.
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

// app.post('/chat', async (req, res) => {
//     try {
//         const userInput = req.body?.userInput;
//         console.log('incoming /chat req', userInput)
//         if (!userInput) {
//             return res.status(400).json({ error: 'Invalid request body' });
//         }

//         const response = await runChat(userInput, req.session);
//         res.json({ response });
//     } catch (error) {
//         console.error('Error in chat endpoint:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});


// Added functions for hard-coded responses
function getHardCodedResponse(userInput) {
    const responses = {
        'Hello': 'Hello Sam! How can I assist you with your piano practice today?',
        'Sorry, we were on a trip and I wasn’t able to practice': 'No problem, hope you had fun. How much time do you have to practice today?',
        'I have 1 hour':'Plenty of time, here’s what I’m thinking:\n- 5 minutes of scales\n- 10 minutes of a surprise activity\n- 20 minutes reviewing previous pieces\n- 20 minutes learning new material\n- 5 minutes of chill time.\nHow does that sound?',
        'Sounds good':'Great! Let’s start with scales. Play a Eb major scale with both hands, 2 octaves up and down. You were struggling with this last session so we can play it twice.',
        'I’m done':'Great job! I want you to play the Eb major scale with your eyes closed. This will help you focus on your muscle memory. Give it a try!',
        'I finished': {
            text: 'Nice work! Let’s move on to the surprise activity. I was thinking you could sight read this song: Not Like Us by Kendrick Lamar.',
            imageURL: 'https://postimg.cc/NywntDtW',
        },
        // Add more predefined responses here
    };

    return responses[userInput] || 'Sorry, I did not understand that. Could you please rephrase?';
}

// Added endpoint for hard-coded responses
app.post('/chat', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        console.log('incoming /chat req', userInput)
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        const response = getHardCodedResponse(userInput);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
