const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const form = document.getElementById('chat-form');

async function sendMessage() {
  const userMessage = userInput.value;
  userInput.value = ''; // Clear input field
  console.log(userMessage);
  try {
    const response = await fetch('/chat', {
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
  messageDiv.innerText = message;

  const readAloudButton = document.createElement('button');
  readAloudButton.innerText = '🔊';
  readAloudButton.onclick = () => readAloud(message);

  const messageContainer = document.createElement('div');
  messageContainer.className = `messageContainer ${sender}`;
  messageContainer.appendChild(messageDiv);
  messageContainer.appendChild(readAloudButton);

  chatHistory.appendChild(messageContainer);
}

function readAloud(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance); // Replace w/ new code to read text aloud
}

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent form submission
  const loader = document.getElementById('loader');
  loader.style.display = 'block'; // Show the loader
  sendMessage().finally(() => {
    loader.style.display = 'none'; // Hide the loader after the message is sent
  });
});
