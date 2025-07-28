// Theme Management
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIconLight = document.getElementById('theme-icon-light');
        const themeIconDark = document.getElementById('theme-icon-dark');

        if (this.theme === 'dark') {
          themeIconDark.classList.remove("hidden");
          themeIconLight.classList.add("hidden");
        } else {
          themeIconDark.classList.add("hidden");
          themeIconLight.classList.remove("hidden");
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// Message Management
class MessageManager {
    constructor() {
        this.backgroundServiceResponse = ""
        this.recognition;
        this.messages = [];
        this.isTyping = false;
        this.messagesContainer = document.getElementById('messages-container');
        this.init();
    }

    init() {
        this.setInitialTimestamp();
        this.setupMessageInput();
        this.setupVoiceToggle();
        chrome.runtime.onMessage.addListener(this.handleBackgroundListener.bind(this))
    }

    handleBackgroundListener(msg, sender, sendResponse) {
        if (msg.action === "selectedWord") {
            console.log("📨 Received text:", msg.text);
            // Insert it into an input or trigger a command
            const inputEle = document.getElementById("message-input");
            this.backgroundServiceResponse = msg.text;
            inputEle.value = this.backgroundServiceResponse;
        } else if (msg.action === "tabStatus") {
            this.createMessage(msg.text, 'assistant')
        }   
    }


    setInitialTimestamp() {
        const initialTimestamp = document.getElementById('initial-timestamp');
        if (initialTimestamp) {
            initialTimestamp.textContent = this.formatTime(new Date());
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    createMessage(content, sender) {
        const messageId = Date.now().toString();
        const timestamp = new Date();
        
        const message = {
            id: messageId,
            content,
            sender,
            timestamp
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();

        return message;
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.innerHTML = `
            <div class="message-bubble">
                <p>${this.escapeHtml(message.content)}</p>
                <span class="timestamp">${this.formatTime(message.timestamp)}</span>
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="typing-bubble">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
        this.isTyping = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    setupMessageInput() {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        // Enable/disable send button based on input
        input.addEventListener('input', () => {
            const hasContent = input.value.trim().length > 0;
            sendButton.disabled = !hasContent;
        });

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = input.value.trim();
            
            if (content) {
                this.sendMessage(content);
                input.value = '';
                sendButton.disabled = true;
            }
        });

        // Handle Enter key (without Shift)
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    sendMessage(content) {
        // Add user message
        this.createMessage(content, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate assistant response
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const responses = [
                "That's an interesting question! Let me think about that.",
                "I understand what you're asking. Here's my perspective...",
                "Great question! I'd be happy to help with that.",
                "Thanks for sharing that with me. Here's what I think...",
                "I see what you mean. Let me provide some insights on that.",
                "That's a thoughtful observation. Here's how I would approach it...",
                "Interesting point! I have some ideas about that.",
                "I appreciate you bringing that up. Let me share my thoughts..."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.createMessage(randomResponse, 'assistant');
        }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    }

    setupVoiceToggle() {
        const voiceToggle = document.getElementById('voice-toggle');
        const voiceIcon = document.getElementById('voice-icon');
        const disableMicIcon = document.getElementById('mic-off');
        const activeMicIcon = document.getElementById('mic-on');

        let isVoiceActive = false;

        voiceToggle.addEventListener('click', () => {
            isVoiceActive = !isVoiceActive;
            
            if (isVoiceActive) {
                voiceToggle.classList.add('active');
                //voiceIcon.setAttribute('data-lucide', 'mic-off');
                disableMicIcon.classList.add("hidden");
                activeMicIcon.classList.remove("hidden");
                console.log('Starting voice recording...');
                // Here you would implement actual voice recording functionality
                //this.startListening();
            } else {
                voiceToggle.classList.remove('active');
                //voiceIcon.setAttribute('data-lucide', 'mic');
                disableMicIcon.classList.remove("hidden");
                activeMicIcon.classList.add("hidden");
                console.log('Stopping voice recording...');
                // Here you would stop voice recording
                //this.stopListening();
            }
        });
    }


    stopListening() {
      document.getElementById("stopBtn").addEventListener("click", () => {
        if (this.recognition) this.recognition.stop;
      });
    }

    startListening() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = false;
          this.recognition.lang = "en-US";

          recognition.onresult = (event) => {
            const messages = document.getElementById("messages");
            for (let i = event.resultIndex; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                const msg = document.createElement("div");
                msg.textContent = event.results[i][0].transcript.trim();
                messages.appendChild(msg);
              }
            }
          };

          this.recognition.start();
        })
        .catch(err => {
          alert("Mic access denied: " + err.message);
        });
    }
}

// App Initialization
class ChatApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.messageManager = new MessageManager();
        this.init();
    }

    init() {
        // Add any additional app-level initialization here
        this.restoreTab();
        this.openHistory();
        this.setNumberHistoryLinks();
        console.log('Chat app initialized successfully!');
    }

    openHistory() {
        const openHistoryBtn = document.getElementById("chrome-history");

        openHistoryBtn.addEventListener("click", () => {
            chrome.tabs.create({ url: "chrome://history" });
        });
    }

    restoreTab() {
        const restoreTabBtn = document.getElementById("restore-tab");

        restoreTabBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "restore-last-closed-tab" });
        });
    }

    setNumberHistoryLinks() {
        const notificationBadgeEle = document.getElementById("notificationBadge");

        const historyCountPromise = new Promise((resolve, reject) => {
                chrome.history.search({
                text: "",
                startTime: 0,
                maxResults: 100000
            }, (results) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(results.length);
                }
            });
        });

        (async () => {
            try {
                const count = await historyCountPromise;
                notificationBadgeEle.textContent = count > 99 ? "99+" : count;
            } catch (err) {
                notificationBadgeEle.textContent = "0";
                console.error("❌ History API error:", err);
            }
        })();
    }
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    
    new ChatApp();
});