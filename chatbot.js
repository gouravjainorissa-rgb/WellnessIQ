document.addEventListener("DOMContentLoaded", () => {
  // Inject Chatbot HTML
  const chatbotHTML = `
    <!-- Floating Chat Button -->
    <button id="chatbot-toggle-btn" class="chatbot-toggle-btn" onclick="toggleChatbot()">
      💬
    </button>

    <!-- Chatbot Window -->
    <div id="chatbot-window" class="chatbot-window glass" style="display: none;">
      <div class="chatbot-header">
        <h4>WellnessAI Assistant</h4>
        <button onclick="toggleChatbot()" class="close-chat-btn">✖</button>
      </div>
      <div id="chatbot-messages" class="chatbot-messages">
        <!-- Messages will appear here -->
      </div>
      <div class="chatbot-input-area" style="flex-direction: column; gap: 10px;">
        <select id="chatbot-quick-select" onchange="handleQuickSelect()" style="width: 100%; padding: 8px; border-radius: 8px; background: var(--input-bg); color: var(--text-main); border: 1px solid var(--glass-border); font-size: 0.9rem;">
          <option value="" disabled selected>Or choose a topic...</option>
          <option value="How to improve sleep?">How to improve sleep?</option>
          <option value="How to reduce stress?">How to reduce stress?</option>
          <option value="What is a good diet?">What is a good diet?</option>
          <option value="How much water to drink?">How much water to drink?</option>
          <option value="How often to exercise?">How often to exercise?</option>
        </select>
        <div style="display: flex; gap: 10px; width: 100%;">
          <input type="text" id="chatbot-input" placeholder="Ask me about wellness..." onkeypress="handleChatKeyPress(event)" style="flex-grow: 1;">
          <button onclick="sendChatMessage()" class="send-chat-btn">➤</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // Initial greeting
  setTimeout(() => {
    appendBotMessage("Hello! I'm WellnessAI. How can I help you with your health goals today?");
  }, 1000);
});

function handleQuickSelect() {
  const select = document.getElementById('chatbot-quick-select');
  const message = select.value;
  if (message) {
    document.getElementById('chatbot-input').value = message;
    sendChatMessage();
    select.value = ""; // reset
  }
}

function toggleChatbot() {
  const chatWindow = document.getElementById('chatbot-window');
  if (chatWindow.style.display === 'none') {
    chatWindow.style.display = 'flex';
  } else {
    chatWindow.style.display = 'none';
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  
  if (message === '') return;

  // Append user message
  appendUserMessage(message);
  input.value = '';

  // Process and reply
  setTimeout(() => {
    processChatQuery(message);
  }, 600); // slight delay for realism
}

function appendUserMessage(text) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message user-message';
  msgDiv.innerText = text;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendBotMessage(text, isHtml = false) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot-message';
  
  if (isHtml) {
    msgDiv.innerHTML = text;
  } else {
    msgDiv.innerText = text;
  }
  
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

const predefinedQA = [
  { keywords: ['sleep', 'insomnia', 'tired'], answer: 'For better sleep, try maintaining a consistent sleep schedule, avoiding screens 1 hour before bed, and keeping your room cool and dark. The 4-7-8 breathing exercise in the Relaxation Hub can also help!' },
  { keywords: ['stress', 'anxiety', 'overwhelmed'], answer: 'Stress is tough. I recommend trying the Visual Focus Reset in the Relaxation Hub. Also, regular exercise and mindfulness meditation can significantly lower baseline stress levels.' },
  { keywords: ['diet', 'food', 'eating', 'nutrition'], answer: 'A balanced diet rich in whole foods, vegetables, and lean proteins is key. Try to minimize processed foods and added sugars. Stay hydrated!' },
  { keywords: ['water', 'hydration', 'drink'], answer: 'It is generally recommended to drink at least 2 liters (about 8 glasses) of water a day, more if you are active or live in a hot climate.' },
  { keywords: ['exercise', 'workout', 'active'], answer: 'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity a week, plus strength training twice a week.' },
  { keywords: ['bmi', 'weight'], answer: 'BMI is calculated using your height and weight. While it is a useful general metric, it does not account for muscle mass. A healthy diet and regular exercise are more important than the number on the scale.' },
  { keywords: ['hello', 'hi', 'hey'], answer: 'Hi there! How are you feeling today?' },
  { keywords: ['thank you', 'thanks'], answer: 'You are very welcome! Let me know if you need anything else.' }
];

function processChatQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Find a matching answer
  let matchedAnswer = null;
  for (const qa of predefinedQA) {
    for (const keyword of qa.keywords) {
      if (lowerQuery.includes(keyword)) {
        matchedAnswer = qa.answer;
        break;
      }
    }
    if (matchedAnswer) break;
  }

  if (matchedAnswer) {
    appendBotMessage(matchedAnswer);
  } else {
    // Fallback response with dropdown
    const fallbackHTML = `
      I'm not quite sure about that yet, I'm still learning! Would you like to speak to a human expert?
      <div style="margin-top: 10px;">
        <select id="chat-fallback-select" style="width: 100%; padding: 8px; border-radius: 8px; background: var(--input-bg); color: var(--text-main); border: 1px solid var(--primary); margin-bottom: 10px;">
          <option value="" disabled selected>Select an option...</option>
          <option value="support">Contact General Support</option>
          <option value="technical">Report a Technical Issue</option>
          <option value="doctor">Consult a Doctor</option>
          <option value="dietitian">Speak to a Dietitian</option>
          <option value="therapist">Connect with a Therapist</option>
        </select>
        <button class="primary-btn" style="padding: 6px 12px; font-size: 0.9rem; width: 100%;" onclick="handleFallbackSelection(this)">Submit</button>
      </div>
    `;
    appendBotMessage(fallbackHTML, true);
  }
}

function handleFallbackSelection(btnElement) {
  // Find the select element that is a sibling or near the button
  const container = btnElement.parentElement;
  const select = container.querySelector('select');
  const value = select.value;

  if (value === 'support') {
    appendBotMessage("I have notified our general support team. They will email you shortly.");
  } else if (value === 'technical') {
    appendBotMessage("Your technical issue has been logged for our engineering team.");
  } else if (value === 'doctor') {
    appendBotMessage("You can book a priority consultation with our medical team <a href='#' style='color: var(--primary);'>here</a>.");
  } else if (value === 'dietitian') {
    appendBotMessage("You can schedule a session with our registered dietitians <a href='#' style='color: var(--primary);'>here</a>.");
  } else if (value === 'therapist') {
    appendBotMessage("Connect with our licensed therapists by clicking <a href='#' style='color: var(--primary);'>here</a>.");
  } else {
    appendBotMessage("Please select an option first.");
    return; // Don't hide the dropdown if nothing was selected
  }

  // Remove the dropdown so it can't be clicked again
  container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.9rem; font-style: italic;">Option selected.</span>`;
}
