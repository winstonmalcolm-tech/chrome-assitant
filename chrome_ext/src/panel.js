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
    this.API_BASE = 'http://localhost:3000'
    this.init()
  }

  init() {
    this.setInitialTimestamp()
    this.setupMessageInput()

    // Chrome extension message listener
    if (typeof window.chrome !== "undefined" && window.chrome.runtime) {
      window.chrome.runtime.onMessage.addListener(this.handleBackgroundListener.bind(this))
    }

    //Add the past messages here
    chrome.runtime.sendMessage({action: "PAST_MESSAGES"}, (response) => {
      console.log(response);
      if (response.success == false) {
        this.createMessage(response.error, "assistant")
        return;
      }

      for (let i=0; i<response.data.length; i++) {
        this.messages.push({
          id: response.data[i].id,
          content: response.data[i].message,
          sender: (response.data[i].role == "model") ? "assistant" : "user",
          timestamp: response.data[i].time
        })
        this.createMessage(response.data[i].message, (response.data[i].role == "model") ? "assistant" : "user", response.data[i].time, response.data[i].id);
      }

      // Add initial assistant message
      (this.messages.length == 0) ? this.createMessage("Hello! How can I help you today?", "assistant") : null;
    });

    
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
    const formatted = date.toLocaleString('en-US', {
      weekday: 'short',   // "Mon"
      month: 'short',     // "Sep"
      day: 'numeric',     // "8"
      year: 'numeric',    // "2025"
      hour: '2-digit',    // "09"
      minute: '2-digit',  // "40"
      hour12: true        // "AM/PM" format
    });

    return formatted;
  }

  createMessage(content, sender, time, id) {
    const messageId = Date.now().toString()
    const timestamp = new Date()

    const message = {
      id: (!id) ? messageId : id,
      content,
      sender,
      timestamp: (!time) ? timestamp : time,
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

    chrome.runtime.sendMessage({action: "CHAT", prompt: content}, (response) => {
      this.hideTypingIndicator()

      if (response.success == false) {
        this.createMessage(response.error, "assistant");
        return;
      }

      this.createMessage(response.data, "assistant")
    });
  }
}

// Simple Account Management - Sign In Button Only
class AccountManager {
  constructor() {
    this.isLoggedIn = false
    this.userData = null
    this.errorMessage = "";
    this.SIGNIN_URL = 'http://localhost:5173/signin' // Replace with your actual sign-in URL
    this.init()
  }

  init() {
    this.bindEvents()
    this.checkAuthStatus()
    this.updateUI()
    window.chrome.runtime.onMessage.addListener(this.handleBackgroundListener.bind(this))
  }

  handleBackgroundListener(msg, sender, sendResponse) {
    if (msg.action === "EXT_LOGOUT") {
      this.isLoggedIn = false
      this.userData = null
      this.updateUI()
    } 
}

  async checkAuthStatus() {
    chrome.storage.local.get(["authTokens"], (result) => {
      const token = result.authTokens;
      
      if (token == null) {
        return;
      }

      chrome.runtime.sendMessage({action: "FETCH_USER"}, (response) => {
        if (response.success == false) {
          this.errorMessage = response.error;
          return;
        }
        console.log(response.data);
        this.userData = response.data
        this.isLoggedIn = true;
        this.updateUI();
      });
    });
  }


  bindEvents() {
    // Sign In button
    const signinButton = document.getElementById('signin-button')
    if (signinButton) {
      signinButton.addEventListener('click', () => this.handleSignIn())
    }

    // Logout button
    const logoutButton = document.getElementById('logout-btn')
    if (logoutButton) {
      logoutButton.addEventListener('click', () => this.handleLogout())
    }

    // Upgrade button
    const upgradeButton = document.getElementById('upgrade-btn')
    if (upgradeButton) {
      upgradeButton.addEventListener('click', () => this.handleUpgrade())
    }

    // Listen for storage changes (in case user signs in from another tab)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && (changes.authTokens)) {
          this.checkAuthStatus()
        }
      })
    }
  }

  handleSignIn() {
    chrome.tabs.create({ url: this.SIGNIN_URL })
  }

  handleAuthSuccess(userData) {
    this.userData = userData
    this.isLoggedIn = true
    
    // Update UI
    this.updateUI()
  }

  handleLogout() {
    // Open upgrade page in new tab
    const upgradeUrl = 'http://localhost:5173/dashboard'
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: upgradeUrl })
    } else {
      window.open(upgradeUrl, '_blank')
    }
  }

  handleUpgrade() {
    // Open upgrade page in new tab
    const upgradeUrl = 'http://localhost:5173/dashboard'
    
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: upgradeUrl })
    } else {
      window.open(upgradeUrl, '_blank')
    }
  }

  updateUI() {
    const signinState = document.getElementById('signin-state')
    const profileState = document.getElementById('profile-state')

    if (this.isLoggedIn && this.userData) {
      // Show profile state
      if (signinState) signinState.classList.remove('active')
      if (profileState) profileState.classList.add('active')

      // Update profile information
      this.updateProfileDisplay()
    } else {
      // Show sign-in state
      if (profileState) profileState.classList.remove('active')
      if (signinState) signinState.classList.add('active')
    }
  }

  updateProfileDisplay() {
    if (!this.userData) return

    // Update user name
    const userName = document.getElementById('user-name')
    if (userName) {
      userName.textContent = this.userData.username || 'User'
    }

    // Update user email
    const userEmail = document.getElementById('user-email')
    if (userEmail) {
      userEmail.textContent = this.userData.email || ''
    }

    // Update avatar
    const userAvatar = document.getElementById('user-avatar')
    const avatarFallback = document.getElementById('avatar-fallback')
    
    if (userAvatar && avatarFallback) {
      if (this.userData.avatar) {
        userAvatar.src = this.userData.avatar
        userAvatar.style.display = 'block'
        avatarFallback.style.display = 'none'
      } else {
        userAvatar.style.display = 'none'
        avatarFallback.style.display = 'flex'
        const displayName = this.userData.username || this.userData.email || 'U'
        avatarFallback.textContent = displayName.charAt(0).toUpperCase()
      }
    }

    // Update plan display
    const planDisplay = document.getElementById('plan-display')
    const upgradeBtn = document.getElementById('upgrade-btn')
    
    if (planDisplay) {
      if (this.userData.plan_name.toLowerCase() === 'pro plan') {
        planDisplay.textContent = 'Pro Plan • Unlimited prompts'
        planDisplay.style.backgroundColor = '#10b981'
        planDisplay.style.color = 'white'
        
        // Hide upgrade button for pro users
        if (upgradeBtn) upgradeBtn.style.display = 'none'
      } else {
        const promptsRemaining = parseInt(this.userData.token_quota) - parseInt(this.userData.total_tokens) || 0
        planDisplay.textContent = `Free Plan • ${(promptsRemaining) < 0 ? 0 : promptsRemaining} prompts remaining`
        planDisplay.style.backgroundColor = '#f8fafc'
        planDisplay.style.color = '#94a3b8'
        
        // Show upgrade button for free users
        if (upgradeBtn) upgradeBtn.style.display = 'flex'
      }
    }
  }

  // Public API methods for external integration
  isUserLoggedIn() {
    return this.isLoggedIn
  }

  getUserData() {
    return this.userData
  }
}

// Enhanced Chat Interface with all features
class ChatInterface {
  constructor() {
    this.currentScreen = "chat"
    this.paraphraseStyle = "neutral"

    // Initialize managers
    this.themeManager = new ThemeManager()
    this.messageManager = new MessageManager()
    this.accountManager = new AccountManager()

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
    const paraphraseStyleSelect = document.getElementById("paraphrase-style")
    if (paraphraseStyleSelect) {
      paraphraseStyleSelect.addEventListener("change", (e) => {
        this.handleParaphraseStyleChange(e.target.value)
      })
    }

    const paraphraseButton = document.getElementById("paraphrase-button")
    if (paraphraseButton) {
      paraphraseButton.addEventListener("click", () => {
        this.handleParaphrase()
      })
    }

    const generateTemplateBtn = document.getElementById('generate-template')
    
    if (generateTemplateBtn) {
      generateTemplateBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const isGoogleDocs = activeTab.url?.startsWith("https://docs.google.com/document");

          if (isGoogleDocs) {
            // Already on Google Docs — send message directly
            chrome.tabs.sendMessage(activeTab.id, { action: "OPEN_TEMPLATE_GENERATOR" }, (response) => {
              console.log("Response from content script:", response);
            });
          } else {
            // Not on Google Docs — open a new tab
            chrome.tabs.create({ url: "https://docs.google.com/document/u/0/" }, (newTab) => {
              // Wait for the tab to finish loading before messaging
              chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === newTab.id && info.status === "complete") {
                  chrome.tabs.sendMessage(tabId, { action: "OPEN_TEMPLATE_GENERATOR" }, (response) => {
                    console.log("Response from content script (new tab):", response);
                  });

                  // Clean up the listener
                  chrome.tabs.onUpdated.removeListener(listener);
                }
              });
            });
          }
        });
      });
    }
    
  }

  switchScreen(screenName) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active")
    })

    // Show selected screen
    const targetScreen = document.getElementById(`${screenName}-screen`)
    if (targetScreen) {
      targetScreen.classList.add("active")
    }

    // Update navigation buttons
    document.querySelectorAll(".nav-button").forEach((button) => {
      button.classList.remove("active")
    })
    const targetNavButton = document.querySelector(`[data-screen="${screenName}"]`)
    if (targetNavButton) {
      targetNavButton.classList.add("active")
    }

    this.currentScreen = screenName
  }

  handleParaphraseStyleChange(style) {
    this.paraphraseStyle = style
    const customInput = document.getElementById("custom-style-input")

    if (customInput) {
      if (style === "custom") {
        customInput.classList.remove("hidden")
      } else {
        customInput.classList.add("hidden")
      }
    }
  }

  async handleParaphrase() {
    const input = document.getElementById("paraphrase-input")
    const button = document.getElementById("paraphrase-button")
    const outputSection = document.getElementById("paraphrasing-output-section")
    const output = document.getElementById("paraphrasing-output")
    const customStyleInput = document.getElementById("custom-style-input")

    if (!input || !button || !outputSection || !output) return

    const text = input.value.trim()
    if (!text) return

    button.disabled = true
    button.textContent = "Paraphrasing..."

    const styleInstruction = this.paraphraseStyle === "custom" && customStyleInput ? customStyleInput.value : this.paraphraseStyle

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

    chrome.runtime.sendMessage({action: "PARAPHRASE", prompt: prompt}, (response) => {
      console.log(response);
      button.disabled = false
      button.textContent = "Paraphrase Text"
      outputSection.classList.remove("hidden")

      if (response.success == false) {
        output.innerHTML = response.error;
        return;
      }

      output.innerHTML = response.data;
    });
  }

  // Chrome Extension specific features
  openHistory() {
    const openHistoryBtn = document.getElementById("chrome-history")
    if (openHistoryBtn) {
      openHistoryBtn.addEventListener("click", () => {
        if (typeof chrome !== "undefined" && chrome.tabs) {
          chrome.tabs.create({ url: "chrome://history" })
        }
      })
    }
  }

  restoreTab() {
    const restoreTabBtn = document.getElementById("restore-tab")
    if (restoreTabBtn) {
      restoreTabBtn.addEventListener("click", () => {
        if (typeof chrome !== "undefined" && chrome.runtime) {
          chrome.runtime.sendMessage({ action: "restore-last-closed-tab" })
        }
      })
    }
  }

  setNumberHistoryLinks() {
    chrome.history.search({ text: "", maxResults: 1000 }, (results) => {
      document.getElementById("notificationBadge").textContent = results.length > 99 ? "99+" : results.length;
    });
  }
}

// Initialize the chat interface when the page loads
let chatInterface
document.addEventListener("DOMContentLoaded", async () => {
  chatInterface = new ChatInterface()
})