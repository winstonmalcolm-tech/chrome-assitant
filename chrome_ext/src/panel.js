import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";

// Theme Management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light"
    this.init()
  }

  init() {
    this.applyTheme()
    this.setupThemeToggle()
  }

  applyTheme() {
    const appContainer = document.getElementById("app-container")
    if (this.theme === "dark") {
      appContainer.classList.add("dark")
    } else {
      appContainer.classList.remove("dark")
    }
    this.updateThemeIcon()
  }

  updateThemeIcon() {
    const themeIconLight = document.getElementById("theme-icon-light")
    const themeIconDark = document.getElementById("theme-icon-dark")

    if (this.theme === "dark") {
      themeIconDark.classList.add("hidden")
      themeIconLight.classList.remove("hidden")
    } else {
      themeIconDark.classList.remove("hidden")
      themeIconLight.classList.add("hidden")
    }
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light"
    localStorage.setItem("theme", this.theme)
    this.applyTheme()
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme())
    }
  }
}

// Message Management
class MessageManager {
  constructor() {
    this.backgroundServiceResponse = ""
    this.recognition = null
    this.messages = []
    this.isTyping = false
    this.messagesContainer = document.getElementById("messages-container")
    this.isVoiceActive = false
    this.ai = new GoogleGenAI({apiKey: "AIzaSyD6wTdywF7xH69tzGFTfE3rpSCxA8exmxU"});
    this.init()
  }

  init() {
    this.setInitialTimestamp()
    this.setupMessageInput()
    this.setupVoiceToggle()

    // Chrome extension message listener
    if (typeof window.chrome !== "undefined" && window.chrome.runtime) {
      window.chrome.runtime.onMessage.addListener(this.handleBackgroundListener.bind(this))
    }

    // Add initial assistant message
    this.createMessage("Hello! How can I help you today?", "assistant")
  }

  handleBackgroundListener(msg, sender, sendResponse) {
    if (msg.action === "selectedWord") {
      console.log("📨 Received text:", msg.text)
      const inputEle = document.getElementById("message-input")
      this.backgroundServiceResponse = msg.text
      inputEle.value = this.backgroundServiceResponse

      // Enable send button
      const sendButton = document.getElementById("send-button")
      sendButton.disabled = false
    } else if (msg.action === "tabStatus") {
      this.createMessage(msg.text, "assistant")
    }
  }

  setInitialTimestamp() {
    const initialTimestamp = document.getElementById("initial-timestamp")
    if (initialTimestamp) {
      initialTimestamp.textContent = this.formatTime(new Date())
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  createMessage(content, sender) {
    const messageId = Date.now().toString()
    const timestamp = new Date()

    const message = {
      id: messageId,
      content,
      sender,
      timestamp,
    }

    this.messages.push(message)
    this.renderMessage(message)
    this.scrollToBottom()
    return message
  }

  renderMessage(message) {
    const messageElement = document.createElement("div")
    messageElement.className = `message ${message.sender}-message`
    messageElement.innerHTML = `
            <div class="message-bubble">
                <p>${message.sender == "assistant" ? message.content : this.escapeHtml(message.content)}</p>
                <span class="timestamp">${this.formatTime(message.timestamp)}</span>
            </div>
        `
    this.messagesContainer.appendChild(messageElement)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  showTypingIndicator() {
    if (this.isTyping) return

    this.isTyping = true
    const typingElement = document.createElement("div")
    typingElement.className = "message assistant-message typing-indicator"
    typingElement.id = "typing-indicator"
    typingElement.innerHTML = `
            <div class="message-bubble typing-bubble">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `
    this.messagesContainer.appendChild(typingElement)
    this.scrollToBottom()
  }

  hideTypingIndicator() {
    const typingElement = document.getElementById("typing-indicator")
    if (typingElement) {
      typingElement.remove()
    }
    this.isTyping = false
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }, 100)
  }

  setupMessageInput() {
    const form = document.getElementById("chat-form")
    const input = document.getElementById("message-input")
    const sendButton = document.getElementById("send-button")

    // Enable/disable send button based on input
    input.addEventListener("input", () => {
      const hasContent = input.value.trim().length > 0
      sendButton.disabled = !hasContent
    })

    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const content = input.value.trim()

      if (content) {
        this.sendMessage(content)
        input.value = ""
        sendButton.disabled = true
      }
    })

    // Handle Enter key (without Shift)
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        form.dispatchEvent(new Event("submit"))
      }
    })
  }

  async sendMessage(content) {
    // Add user message
    this.createMessage(content, "user")

    // Show typing indicator
    this.showTypingIndicator()

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content
    });

    this.hideTypingIndicator()

    this.createMessage(marked(response.text), "assistant")
  }

  setupVoiceToggle() {
    const voiceToggle = document.getElementById("voice-toggle")
    const disableMicIcon = document.getElementById("mic-off")
    const activeMicIcon = document.getElementById("mic-on")

    voiceToggle.addEventListener("click", () => {
      this.isVoiceActive = !this.isVoiceActive

      if (this.isVoiceActive) {
        voiceToggle.classList.add("active")
        disableMicIcon.classList.add("hidden")
        activeMicIcon.classList.remove("hidden")
        console.log("Starting voice recording...")
        this.startListening()
      } else {
        voiceToggle.classList.remove("active")
        disableMicIcon.classList.remove("hidden")
        activeMicIcon.classList.add("hidden")
        console.log("Stopping voice recording...")
        this.stopListening()
      }
    })
  }

  startListening() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Speech recognition not supported")
      return
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
          console.error("Speech recognition not supported")
          return
        }

        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = false
        this.recognition.lang = "en-US"

        this.recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript.trim()
              const messageInput = document.getElementById("message-input")
              messageInput.value = transcript

              // Enable send button
              const sendButton = document.getElementById("send-button")
              sendButton.disabled = false
            }
          }
        }

        this.recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
        }

        this.recognition.start()
      })
      .catch((err) => {
        console.error("Mic access denied:", err.message)
        alert("Microphone access denied. Please allow microphone access to use voice input.")
      })
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
  }
}


// Enhanced Chat Interface with all features
class ChatInterface {
  constructor() {
    this.currentScreen = "chat"
    this.paraphraseStyle = "neutral"
    this.ai = new GoogleGenAI({apiKey: "AIzaSyD6wTdywF7xH69tzGFTfE3rpSCxA8exmxU"});

    // Initialize managers
    this.themeManager = new ThemeManager()
    this.messageManager = new MessageManager()

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.restoreTab()
    this.openHistory()
    this.setNumberHistoryLinks()
    console.log("Chat app initialized successfully!")
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const screen = e.currentTarget.dataset.screen
        this.switchScreen(screen)
      })
    })

    // Paraphrasing functionality
    document.getElementById("paraphrase-style").addEventListener("change", (e) => {
      this.handleParaphraseStyleChange(e.target.value)
    })

    document.getElementById("paraphrase-button").addEventListener("click", () => {
      this.handleParaphrase()
    })

    document.getElementById('generate-template').addEventListener('click', async () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'openModal'});
      });
    });
  }

  switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active")
    })

    // Show selected screen
    document.getElementById(`${screenName}-screen`).classList.add("active")

    // Update navigation buttons
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.classList.remove("active")
    })
    document.querySelector(`[data-screen="${screenName}"]`).classList.add("active")

    this.currentScreen = screenName
  }

  handleParaphraseStyleChange(style) {
    this.paraphraseStyle = style
    const customInput = document.getElementById("custom-style-input")

    if (style === "custom") {
      customInput.classList.remove("hidden")
    } else {
      customInput.classList.add("hidden")
    }
  }

  async handleParaphrase() {
    const input = document.getElementById("paraphrase-input")
    const button = document.getElementById("paraphrase-button")
    const outputSection = document.getElementById("paraphrasing-output-section")
    const output = document.getElementById("paraphrasing-output")
    const customStyleInput = document.getElementById("custom-style-input")

    const text = input.value.trim()
    if (!text) return

    button.disabled = true
    button.textContent = "Paraphrasing..."

    const styleInstruction = this.paraphraseStyle === "custom" ? customStyleInput.value : this.paraphraseStyle

    const prompt = `
      Task: Paraphrase the following text to match a specific writing style.

      Original Text:
      "${text}"

      Desired Style:
      "${styleInstruction}"

      Instructions:
      - Rewrite the original text according to the selected style.
      - Preserve the core meaning and intent.
      - Reflect the tone, vocabulary, and sentence structure.
    `;


    const response = await fetch("http://localhost:3000/ai/generate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        })
      });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    output.innerHTML = result.message;
    outputSection.classList.remove("hidden")

    button.disabled = false
    button.textContent = "Paraphrase Text"
  }

  // Chrome Extension specific features
  openHistory() {
    const openHistoryBtn = document.getElementById("chrome-history")
    if (openHistoryBtn) {
      openHistoryBtn.addEventListener("click", () => {
        if (typeof window.chrome !== "undefined" && window.chrome.tabs) {
          window.chrome.tabs.create({ url: "chrome://history" })
        }
      })
    }
  }

  restoreTab() {
    const restoreTabBtn = document.getElementById("restore-tab")
    if (restoreTabBtn) {
      restoreTabBtn.addEventListener("click", () => {
        if (typeof window.chrome !== "undefined" && window.chrome.runtime) {
          window.chrome.runtime.sendMessage({ action: "restore-last-closed-tab" })
        }
      })
    }
  }

  setNumberHistoryLinks() {
    const notificationBadgeEle = document.getElementById("notificationBadge")
    if (!notificationBadgeEle) return

    if (typeof window.chrome !== "undefined" && window.chrome.history) {
      const historyCountPromise = new Promise((resolve, reject) => {
        window.chrome.history.search(
          {
            text: "",
            startTime: 0,
            maxResults: 100000,
          },
          (results) => {
            if (window.chrome.runtime.lastError) {
              reject(window.chrome.runtime.lastError)
            } else {
              resolve(results.length)
            }
          },
        )
      })
      ;(async () => {
        try {
          const count = await historyCountPromise
          notificationBadgeEle.textContent = count > 99 ? "99+" : count
        } catch (err) {
          notificationBadgeEle.textContent = "0"
          console.error("❌ History API error:", err)
        }
      })()
    } else {
      // Fallback for non-extension environment
      notificationBadgeEle.textContent = "10"
    }
  }
}

// Initialize the chat interface when the page loads
let chatInterface
document.addEventListener("DOMContentLoaded", async () => {
  chatInterface = new ChatInterface()
})
