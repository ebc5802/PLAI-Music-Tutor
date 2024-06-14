const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const form = document.getElementById('chat-form');

let useAIChat = true;

document.getElementById('toggleButton').addEventListener('click', () => {
    useAIChat = !useAIChat;
    document.getElementById('toggleButton').innerText = useAIChat ? 'Switch to Hard-Coded Chat' : 'Switch to AI Chat';
});

async function sendMessage() {
  const userMessage = userInput.value;
  userInput.value = ''; // Clear input field
  console.log(userMessage);
  const endpoint = useAIChat ? '/geminiChat' : '/hardCodedChat'; // Determine the endpoint based on useAIChat
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: userMessage }),
    });

    const data = await response.json();
    console.log(data);
    const botMessage = data.response;
    console.log(botMessage);
    
    // Add user message to the chat history
    addMessageToHistory('user', userMessage);
    
    // Add bot message to the chat history
    addMessageToHistory('bot', botMessage);
    
    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
  } catch (error) {
    console.error('Error:', error);
    // Handle errors gracefully, e.g., display an error message to the user
  }
}

function addMessageToHistory(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `${sender}-message`;
  // Check if message is an object (contains text and imageURL)
  if (typeof message === 'object') {
    messageDiv.innerText = message.text;

    // If imageURL exists, create an img element and append it
    if (message.imageURL) {
      const image = document.createElement('img');
      image.src = message.imageURL;
      image.style.width = '400px'; // Set the width of the image
      image.style.height = 'auto'; // Set the height to auto to maintain aspect ratio
      messageDiv.appendChild(image);
    }
  } else {
    // If message is a string, just set the innerText
    messageDiv.innerText = message;
  }

  const readAloudButton = document.createElement('button');
  readAloudButton.innerText = '🔊';
  readAloudButton.onclick = () => readAloud(message);

  const messageContainer = document.createElement('div');
  messageContainer.className = `messageContainer ${sender}`;
  messageContainer.appendChild(messageDiv);
  messageContainer.appendChild(readAloudButton);

  chatHistory.appendChild(messageContainer);
}

// function readAloud(text) {
//   const utterance = new SpeechSynthesisUtterance(text);
//   window.speechSynthesis.speak(utterance); // Replace w/ new code to read text aloud
// }

// NOT WORKING CODE
// async function readAloud(text) {
//   try {
//     // Fetch the API key from the server
//     const apiKeyResponse = await fetch('/elevenlabs-api-key');
//     const { apiKey } = await apiKeyResponse.json();

//     const response = await fetch('https://api.elevenlabs.com/tts', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}` // replace with your API key
//       },
//       body: JSON.stringify({ text: text, voice: 'en-US' }) // replace 'en-US' with the desired voice
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const audioBlob = await response.blob();
//     const audioUrl = URL.createObjectURL(audioBlob);
//     const audio = new Audio(audioUrl);
//     audio.play();
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

async function readAloud(text) {
  try {
    // Fetch the API key from the server
    const apiKeyResponse = await fetch('/elevenlabs-api-key');
    const { apiKey } = await apiKeyResponse.json();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text: text,
        model_id: "model_id_value", // replace with your model_id
        voice_settings: {
          stability: 123,
          similarity_boost: 123,
          style: 123,
          use_speaker_boost: true
        },
        pronunciation_dictionary_locators: [{
          pronunciation_dictionary_id: "dictionary_id_value", // replace with your pronunciation_dictionary_id
          version_id: "version_id_value" // replace with your version_id
        }],
        seed: 123,
        previous_text: "previous_text_value", // replace with your previous_text
        next_text: "next_text_value", // replace with your next_text
        previous_request_ids: ["previous_request_id_value"], // replace with your previous_request_ids
        next_request_ids: ["next_request_id_value"] // replace with your next_request_ids
      })
    };

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/en-US`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseJson = await response.json();
    console.log(responseJson);
  } catch (error) {
    console.error('Error:', error);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission
  const loader = document.getElementById('loader');
  loader.style.display = 'block'; // Show the loader
  sendMessage().finally(() => {
    loader.style.display = 'none'; // Hide the loader after the message is sent
  });
});


const audioFiles = [
  new Audio('../audio_files/demo_audio_1.wav'),
  // Add more audio files here
];

let currentAudio = 0;

document.getElementById('demoButton').addEventListener('click', () => {
  // Play the current audio file
  audioFiles[currentAudio].play();

  // Advance the counter
  currentAudio = (currentAudio + 1) % audioFiles.length;
});