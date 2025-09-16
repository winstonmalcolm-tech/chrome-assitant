class EmailGrammarChecker {
  constructor() {
    this.highlightContainer = null;
    this.activePopup = null;
    this.trackedInputs = /* @__PURE__ */ new Map();
    this.debounceTimers = /* @__PURE__ */ new Map();
    this.isProcessing = false;
    this.currentProvider = this.detectEmailProvider();
    this.resizeObserver = null;
    this.scrollThrottleTimer = null;
    this.isScrolling = false;
    this.scrollEndTimer = null;
    this.floatingActionButton = null;
    this.activeTemplateModal = null;
    this.typingTimers = /* @__PURE__ */ new Map();
    this.dialogObservers = /* @__PURE__ */ new Map();
    this.fabVisibilityTimer = null;
    console.log(`Email Grammar Checker initialized for: ${this.currentProvider}`);
    this.init();
  }
  detectEmailProvider() {
    const hostname = window.location.hostname;
    if (hostname.includes("gmail") || hostname.includes("mail.google")) {
      return "gmail";
    } else if (hostname.includes("outlook")) {
      return "outlook";
    } else if (hostname.includes("yahoo")) {
      return "yahoo";
    }
    return "unknown";
  }
  init() {
    this.createHighlightContainer();
    this.createFloatingActionButton();
    this.setupGlobalEventListeners();
    this.startMonitoring();
    this.setupResizeObserver();
  }
  createHighlightContainer() {
    this.highlightContainer = document.createElement("div");
    this.highlightContainer.id = "email-grammar-highlights";
    this.highlightContainer.className = "email-grammar-container";
    this.highlightContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999998;
      opacity: 1;
      transition: opacity 0.2s ease-out;
    `;
    document.body.appendChild(this.highlightContainer);
  }
  createFloatingActionButton() {
    if (this.floatingActionButton && this.floatingActionButton.parentNode) {
      this.floatingActionButton.parentNode.removeChild(this.floatingActionButton);
    }
    const fab = document.createElement("button");
    fab.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 600; font-size: 14px;">Generate Email</span>
      </div>
    `;
    fab.className = "email-ai-fab";
    fab.type = "button";
    fab.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000000;
      background: #346FC7;
      color: white;
      border: none;
      border-radius: 28px;
      padding: 14px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 140px;
      backdrop-filter: blur(10px);
      opacity: 0;
      transform: translateY(100px) scale(0.8);
      visibility: hidden;
    `;
    fab.addEventListener("mouseenter", () => {
      if (fab.style.visibility !== "hidden") {
        fab.style.transform = "translateY(0) scale(1.05)";
        fab.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.5)";
      }
    });
    fab.addEventListener("mouseleave", () => {
      if (fab.style.visibility !== "hidden") {
        fab.style.transform = "translateY(0) scale(1)";
        fab.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
      }
    });
    fab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("FAB clicked!");
      try {
        const activeElement = this.findActiveComposeElement();
        if (activeElement) {
          this.showTemplateModal(activeElement);
        } else {
          console.warn("No active compose element found");
          this.showNotification("Please click in the email compose area first", "error");
        }
      } catch (error) {
        console.error("Error showing template modal from FAB:", error);
      }
    });
    document.body.appendChild(fab);
    this.floatingActionButton = fab;
    console.log("Floating Action Button created");
    this.startFabVisibilityMonitoring();
  }
  startFabVisibilityMonitoring() {
    const checkFabVisibility = () => {
      const shouldShow = this.shouldShowFab();
      console.log(`FAB visibility check: shouldShow=${shouldShow}, provider=${this.currentProvider}`);
      this.updateFabVisibility(shouldShow);
    };
    if (this.currentProvider === "outlook") {
      setTimeout(checkFabVisibility, 2e3);
      setInterval(checkFabVisibility, 1e3);
      document.addEventListener("focusin", () => {
        setTimeout(checkFabVisibility, 100);
      });
      document.addEventListener("click", () => {
        setTimeout(checkFabVisibility, 100);
      });
      const observer = new MutationObserver(() => {
        if (this.fabVisibilityTimer) {
          clearTimeout(this.fabVisibilityTimer);
        }
        this.fabVisibilityTimer = setTimeout(checkFabVisibility, 200);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "contenteditable"]
      });
    } else {
      setTimeout(checkFabVisibility, 1e3);
      setInterval(checkFabVisibility, 2e3);
      const observer = new MutationObserver(() => {
        if (this.fabVisibilityTimer) {
          clearTimeout(this.fabVisibilityTimer);
        }
        this.fabVisibilityTimer = setTimeout(checkFabVisibility, 500);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "aria-hidden", "hidden"]
      });
    }
  }
  shouldShowFab() {
    console.log(`Checking FAB visibility for ${this.currentProvider}`);
    if (this.currentProvider === "outlook") {
      const outlookComposeElements = document.querySelectorAll('div[contenteditable="true"]');
      console.log(`Found ${outlookComposeElements.length} contenteditable elements in Outlook`);
      for (const element of outlookComposeElements) {
        if (this.isElementVisible(element)) {
          const rect = element.getBoundingClientRect();
          if (rect.width > 200 && rect.height > 50) {
            console.log("Found visible compose-like contenteditable element:", element);
            return true;
          }
        }
      }
      for (const [element, inputData] of this.trackedInputs) {
        if (inputData.type === "body" && this.isElementVisible(element)) {
          console.log("Found visible tracked body input:", element);
          return true;
        }
      }
      const outlookIndicators = [
        '[data-testid*="composer"]',
        '[data-testid*="send"]',
        '[aria-label*="Send"]',
        '[title*="Send"]',
        'button[data-testid*="send"]'
      ];
      for (const selector of outlookIndicators) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Found Outlook indicator: ${selector} (${elements.length} elements)`);
          for (const element of elements) {
            if (this.isElementVisible(element)) {
              console.log("Visible Outlook compose indicator found");
              return true;
            }
          }
        }
      }
      console.log("No Outlook compose elements found");
      return false;
    }
    const composeSelectors = this.getComposeDialogSelectors();
    console.log(`Using selectors for ${this.currentProvider}:`, composeSelectors);
    for (const selector of composeSelectors) {
      try {
        const dialogs = document.querySelectorAll(selector);
        console.log(`Found ${dialogs.length} dialogs for selector: ${selector}`);
        for (const dialog of dialogs) {
          const isVisible = this.isElementVisible(dialog);
          const isActive = this.isComposeDialogActive(dialog);
          console.log(`Dialog check:`, {
            selector,
            dialog: dialog.tagName + (dialog.className ? "." + dialog.className.split(" ")[0] : ""),
            isVisible,
            isActive,
            shouldShow: isVisible && isActive
          });
          if (isVisible && isActive) {
            return true;
          }
        }
      } catch (e) {
        console.log(`Error with selector ${selector}:`, e.message);
      }
    }
    for (const [element, inputData] of this.trackedInputs) {
      if (inputData.type === "body" && this.isElementVisible(element)) {
        const dialog = this.findDialogContainer(element);
        if (dialog && this.isElementVisible(dialog)) {
          console.log("Found visible body input with dialog container");
          return true;
        }
      }
    }
    console.log("No visible compose dialogs found");
    return false;
  }
  getComposeDialogSelectors() {
    const selectors = {
      gmail: [
        '[role="dialog"]:not([aria-hidden="true"])',
        '.nH[role="dialog"]:not([aria-hidden="true"])',
        '.aO7:not([aria-hidden="true"])',
        '.nH.aO7:not([aria-hidden="true"])',
        '[jscontroller*="compose"]:not([aria-hidden="true"])'
      ],
      outlook: [
        // More comprehensive Outlook selectors
        '[data-app-section="ComposeContainer"]',
        '[data-app-section="ComposeBody"]',
        '[data-testid*="composer"]:not([aria-hidden="true"])',
        '[data-testid="composer-container"]',
        '[data-testid="message-composer"]',
        '.ms-FocusZone[data-testid*="composer"]',
        '[role="main"][data-testid*="composer"]',
        '[aria-label*="Compose"]',
        // Additional Outlook compose indicators
        'div[class*="compose"]:not([aria-hidden="true"])',
        'div[class*="ComposeContainer"]',
        '[data-testid="rooster-editor-focus-trap-zone"]',
        // Broader selectors for Outlook compose areas
        'div[role="main"] div[contenteditable="true"]',
        'div[data-testid*="editor-container"]'
      ],
      yahoo: [
        '.compose-container:not([aria-hidden="true"])',
        '[data-test-id*="compose"]:not([aria-hidden="true"])'
      ],
      generic: [
        '.compose:not([aria-hidden="true"])',
        '.email-compose:not([aria-hidden="true"])',
        '[role="dialog"]:not([aria-hidden="true"])',
        '.modal:not([aria-hidden="true"])'
      ]
    };
    return [
      ...selectors[this.currentProvider] || [],
      ...selectors.generic
    ];
  }
  isComposeDialogActive(dialog) {
    try {
      const composeIndicators = [
        '[contenteditable="true"]',
        "textarea",
        'input[type="text"]',
        '[data-testid*="send"]',
        '[aria-label*="Send"]',
        '[title*="Send"]',
        'button[type="submit"]'
      ];
      for (const indicator of composeIndicators) {
        if (dialog.querySelector(indicator)) {
          return true;
        }
      }
      if (this.currentProvider === "gmail") {
        return this.isGmailComposeActive(dialog);
      } else if (this.currentProvider === "outlook") {
        return this.isOutlookComposeActive(dialog);
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  isGmailComposeActive(dialog) {
    const gmailIndicators = [
      ".Am.Al.editable",
      '[g_editable="true"]',
      '[aria-label*="Message Body"]',
      '[data-tooltip*="Send"]',
      ".Ha",
      // Gmail send button area
      '[jsaction*="send"]'
    ];
    return gmailIndicators.some((selector) => {
      try {
        return dialog.querySelector(selector) !== null;
      } catch (e) {
        return false;
      }
    });
  }
  isOutlookComposeActive(dialog) {
    const outlookIndicators = [
      '[data-testid="rooster-editor-focus-trap-zone"]',
      '[data-testid="editor-container"]',
      '[data-testid="composer-editor"]',
      '[data-testid="ComposeSendButton"]',
      '[data-testid*="send"]',
      '.elementToProof[contenteditable="true"]',
      '[aria-label*="Message body"]',
      '[data-testid*="composer"]',
      // Additional broader checks
      'div[contenteditable="true"]',
      'button[data-testid*="send"]',
      '[title*="Send"]'
    ];
    return outlookIndicators.some((selector) => {
      try {
        const element = dialog.querySelector(selector);
        if (element) {
          console.log(`Found Outlook compose indicator: ${selector}`);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    });
  }
  updateFabVisibility(shouldShow) {
    if (!this.floatingActionButton) return;
    const isCurrentlyVisible = this.floatingActionButton.style.visibility !== "hidden" && this.floatingActionButton.style.opacity !== "0";
    console.log(`Updating FAB visibility: shouldShow=${shouldShow}, isCurrentlyVisible=${isCurrentlyVisible}`);
    if (shouldShow && !isCurrentlyVisible) {
      this.floatingActionButton.style.visibility = "visible";
      this.floatingActionButton.style.display = "flex";
      this.floatingActionButton.offsetHeight;
      requestAnimationFrame(() => {
        this.floatingActionButton.style.opacity = "1";
        this.floatingActionButton.style.transform = "translateY(0) scale(1)";
      });
      console.log("FAB shown");
    } else if (!shouldShow && isCurrentlyVisible) {
      this.floatingActionButton.style.opacity = "0";
      this.floatingActionButton.style.transform = "translateY(100px) scale(0.8)";
      setTimeout(() => {
        if (this.floatingActionButton) {
          this.floatingActionButton.style.visibility = "hidden";
          this.floatingActionButton.style.display = "none";
        }
      }, 300);
      console.log("FAB hidden");
    }
  }
  findActiveComposeElement() {
    console.log("Finding active compose element...");
    const activeElement = document.activeElement;
    console.log("Currently focused element:", activeElement);
    if (activeElement && this.trackedInputs.has(activeElement)) {
      const inputData = this.trackedInputs.get(activeElement);
      console.log("Focused element is tracked, type:", inputData.type);
      if (inputData.type === "body") {
        console.log("Found focused body input");
        return activeElement;
      }
    }
    if (this.currentProvider === "outlook") {
      console.log("Outlook: searching for compose elements...");
      const contentEditableElements = document.querySelectorAll('div[contenteditable="true"]');
      console.log(`Found ${contentEditableElements.length} contenteditable elements`);
      for (const element of contentEditableElements) {
        if (this.isElementVisible(element)) {
          const rect = element.getBoundingClientRect();
          console.log("Checking contenteditable element:", {
            element,
            rect: { width: rect.width, height: rect.height },
            isTracked: this.trackedInputs.has(element)
          });
          if (rect.width > 200 && rect.height > 50) {
            if (!this.trackedInputs.has(element)) {
              console.log("Adding untracked contenteditable to tracked inputs");
              this.attachToEmailInput(element);
            }
            console.log("Found suitable Outlook compose element");
            return element;
          }
        }
      }
      for (const [element, inputData] of this.trackedInputs) {
        if (inputData.type === "body" && this.isElementVisible(element)) {
          console.log("Found visible tracked body input");
          return element;
        }
      }
      for (const [element, inputData] of this.trackedInputs) {
        if (this.isElementVisible(element)) {
          console.log("Found visible tracked input (fallback):", inputData.type);
          return element;
        }
      }
      console.log("No suitable Outlook compose element found");
      return null;
    }
    console.log("Non-Outlook: searching tracked inputs...");
    for (const [element, inputData] of this.trackedInputs) {
      if (inputData.type === "body" && this.isElementVisible(element)) {
        const dialog = this.findDialogContainer(element);
        if (dialog && this.isElementVisible(dialog) && this.isComposeDialogActive(dialog)) {
          console.log("Found visible body input in active dialog");
          return element;
        }
      }
    }
    console.log("No active compose element found");
    return null;
  }
  setupResizeObserver() {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver((entries) => {
        this.throttledUpdateAllHighlights();
      });
      this.resizeObserver.observe(document.body);
    }
  }
  startMonitoring() {
    this.scanForEmailInputs();
    const observer = new MutationObserver((mutations) => {
      let shouldRescan = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            shouldRescan = true;
          }
        });
      });
      if (shouldRescan) {
        setTimeout(() => this.scanForEmailInputs(), 500);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    setInterval(() => this.scanForEmailInputs(), 3e3);
  }
  getEmailInputSelectors() {
    const selectors = {
      gmail: [
        // Gmail compose selectors - more specific and current
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"][aria-label*="Message Body"]',
        'div[contenteditable="true"][data-message-id]',
        ".Am.Al.editable",
        '[g_editable="true"]',
        '.gmail_default[contenteditable="true"]',
        'div[contenteditable="true"][dir="ltr"]:not([aria-label*="Subject"]):not([aria-label*="To"]):not([aria-label*="Cc"]):not([aria-label*="Bcc"])',
        // Gmail subject line
        'input[name="subjectbox"]',
        'input[placeholder*="Subject"]',
        'input[aria-label*="Subject"]'
      ],
      outlook: [
        // Outlook compose selectors - updated for 2024
        'div[data-testid="rooster-editor-focus-trap-zone"] div[contenteditable="true"]',
        'div[data-testid="editor-container"] div[contenteditable="true"]',
        '[data-testid="composer-editor"]',
        'div[contenteditable="true"][aria-label*="Message body"]',
        'div[contenteditable="true"][role="textbox"]:not([aria-label*="Subject"]):not([aria-label*="To"]):not([aria-label*="Cc"]):not([aria-label*="Bcc"])',
        '.elementToProof[contenteditable="true"]',
        "#Item\\.MessageUniqueBody_divid",
        // Outlook subject and recipients
        'input[data-testid="composer-subject-field"]',
        'input[aria-label*="Subject"]',
        'input[data-testid="composer-to-field"]',
        'input[data-testid="composer-cc-field"]',
        'input[data-testid="composer-bcc-field"]',
        // More general Outlook selectors
        'div[contenteditable="true"]'
      ],
      yahoo: [
        // Yahoo Mail selectors
        'div[data-test-id="rte"]',
        '.rte-editor[contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]',
        // Yahoo subject
        'input[data-test-id="compose-subject"]'
      ],
      generic: [
        // Generic email selectors
        'div[contenteditable="true"]',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="compose"]',
        'textarea[name*="body"]',
        'input[name*="subject"]'
      ]
    };
    return [
      ...selectors[this.currentProvider] || [],
      ...selectors.generic
    ];
  }
  scanForEmailInputs() {
    const selectors = this.getEmailInputSelectors();
    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          if (this.isValidEmailInput(element) && !this.trackedInputs.has(element)) {
            this.attachToEmailInput(element);
          }
        });
      } catch (e) {
      }
    });
  }
  isValidEmailInput(element) {
    if (!element || this.trackedInputs.has(element)) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width < 30 || rect.height < 15) return false;
    const isEditable = element.contentEditable === "true" || element.tagName === "TEXTAREA" || element.tagName === "INPUT";
    if (!isEditable) return false;
    const ariaLabel = element.getAttribute("aria-label") || "";
    const placeholder = element.placeholder || "";
    const className = element.className || "";
    if (ariaLabel.toLowerCase().includes("search") || placeholder.toLowerCase().includes("search") || className.includes("search") || className.includes("nav")) {
      return false;
    }
    if (this.currentProvider === "gmail") {
      return this.isGmailInput(element);
    } else if (this.currentProvider === "outlook") {
      return this.isOutlookInput(element);
    } else if (this.currentProvider === "yahoo") {
      return this.isYahooInput(element);
    }
    return true;
  }
  isGmailInput(element) {
    const composeContainer = element.closest('[role="dialog"]') || element.closest(".nH") || element.closest("[jscontroller]") || element.closest(".aO7");
    if (!composeContainer) return false;
    element.getAttribute("aria-label") || "";
    const isInComposeWindow = composeContainer.querySelector('[aria-label*="Minimize"]') || composeContainer.querySelector('[aria-label*="Close"]') || composeContainer.querySelector(".Ha") || composeContainer.querySelector('[data-tooltip*="Send"]');
    return isInComposeWindow !== null;
  }
  isOutlookInput(element) {
    if (element.contentEditable === "true") {
      const rect = element.getBoundingClientRect();
      if (rect.width > 200 && rect.height > 30) {
        console.log("Accepting Outlook contenteditable element due to size:", rect);
        return true;
      }
    }
    const composeContainer = element.closest('[data-app-section="ComposeContainer"]') || element.closest('[data-app-section="ComposeBody"]') || element.closest('[data-testid*="composer"]') || element.closest(".ms-FocusZone") || element.closest('[role="main"]');
    if (composeContainer) {
      console.log("Found Outlook compose container for element");
      return true;
    }
    const mainArea = element.closest('[role="main"]') || element.closest("main") || element.closest("#app-mount") || element.closest("[data-app-section]");
    if (mainArea && element.contentEditable === "true") {
      console.log("Accepting contenteditable element in main area");
      return true;
    }
    return false;
  }
  isYahooInput(element) {
    const parent = element.closest("[data-test-id]") || element.closest(".compose-container");
    return parent !== null;
  }
  attachToEmailInput(element) {
    console.log("Attaching to email input:", element, "Type:", this.getInputType(element));
    const inputData = {
      element,
      highlights: [],
      currentIssues: [],
      observer: null,
      lastText: "",
      type: this.getInputType(element)
    };
    this.trackedInputs.set(element, inputData);
    const events = ["input", "keyup", "paste", "focus", "blur"];
    events.forEach((eventType) => {
      element.addEventListener(eventType, (e) => this.handleInputEvent(e), true);
    });
    if (element.contentEditable === "true") {
      this.setupContentObserver(element, inputData);
    }
    setTimeout(() => this.checkGrammar(element), 500);
  }
  getInputType(element) {
    const placeholder = element.placeholder || "";
    const ariaLabel = element.getAttribute("aria-label") || "";
    const name = element.name || "";
    const dataTestId = element.getAttribute("data-testid") || "";
    const className = element.className || "";
    console.log("Determining input type for element:", {
      tagName: element.tagName,
      placeholder,
      ariaLabel,
      name,
      dataTestId,
      className: className.substring(0, 50)
      // Truncate long class names
    });
    const subjectKeywords = ["subject"];
    const lowerPlaceholder = placeholder.toLowerCase();
    const lowerAriaLabel = ariaLabel.toLowerCase();
    const lowerName = name.toLowerCase();
    const lowerTestId = dataTestId.toLowerCase();
    for (const keyword of subjectKeywords) {
      if (lowerPlaceholder.includes(keyword) || lowerAriaLabel.includes(keyword) || lowerName.includes(keyword) || lowerTestId.includes(keyword)) {
        console.log("Identified as subject field");
        return "subject";
      }
    }
    const recipientKeywords = ["to", "cc", "bcc", "recipient"];
    for (const keyword of recipientKeywords) {
      if (lowerPlaceholder.includes(keyword) || lowerAriaLabel.includes(keyword) || lowerName.includes(keyword) || lowerTestId.includes(keyword)) {
        console.log("Identified as recipient field");
        return "recipient";
      }
    }
    if (this.currentProvider === "outlook") {
      const parentElement = element.closest('[data-testid*="to"]') || element.closest('[data-testid*="cc"]') || element.closest('[data-testid*="bcc"]') || element.closest('[data-testid*="subject"]') || element.closest('[aria-label*="To"]') || element.closest('[aria-label*="Cc"]') || element.closest('[aria-label*="Bcc"]') || element.closest('[aria-label*="Subject"]');
      if (parentElement) {
        const parentTestId = parentElement.getAttribute("data-testid") || "";
        const parentAriaLabel = parentElement.getAttribute("aria-label") || "";
        if (parentTestId.includes("subject") || parentAriaLabel.toLowerCase().includes("subject")) {
          console.log("Identified as subject field via parent element");
          return "subject";
        }
        if (parentTestId.includes("to") || parentTestId.includes("cc") || parentTestId.includes("bcc") || parentAriaLabel.toLowerCase().includes("to") || parentAriaLabel.toLowerCase().includes("cc") || parentAriaLabel.toLowerCase().includes("bcc")) {
          console.log("Identified as recipient field via parent element");
          return "recipient";
        }
      }
      if (element.matches('div[data-testid="rooster-editor-focus-trap-zone"] div[contenteditable="true"]') || element.matches('div[data-testid="editor-container"] div[contenteditable="true"]') || element.matches('[data-testid="composer-editor"]') || element.closest('[data-app-section="ComposeBody"]') || element.closest('[data-testid="rooster-editor-focus-trap-zone"]') || element.closest('[data-testid="editor-container"]') || element.contentEditable === "true" && (lowerAriaLabel.includes("message body") || lowerAriaLabel.includes("message") || element.getAttribute("role") === "textbox")) {
        const recipientContainer = element.closest('[data-testid*="composer-to"]') || element.closest('[data-testid*="composer-cc"]') || element.closest('[data-testid*="composer-bcc"]') || element.closest('[data-testid*="composer-subject"]');
        if (!recipientContainer) {
          console.log("Identified as body field via Outlook patterns");
          return "body";
        }
      }
      if (element.contentEditable === "true") {
        const rect = element.getBoundingClientRect();
        if (rect.width > 200 && rect.height > 50) {
          console.log("Identified as body field via size heuristic for Outlook");
          return "body";
        }
      }
    }
    if (this.currentProvider === "gmail") {
      if (element.matches('div[contenteditable="true"][role="textbox"]') || element.matches('div[contenteditable="true"][aria-label*="Message Body"]') || element.matches('div[contenteditable="true"][data-message-id]') || element.matches(".Am.Al.editable") || element.matches('[g_editable="true"]') || element.contentEditable === "true" && (lowerAriaLabel.includes("message body") || lowerAriaLabel.includes("compose") || className.includes("editable") || element.getAttribute("role") === "textbox")) {
        if (!lowerAriaLabel.includes("subject") && !lowerPlaceholder.includes("subject") && !element.closest('[aria-label*="Subject"]')) {
          console.log("Identified as body field via Gmail patterns");
          return "body";
        }
      }
    }
    if (element.contentEditable === "true") {
      if (!lowerAriaLabel.includes("subject") && !lowerAriaLabel.includes("to") && !lowerAriaLabel.includes("cc") && !lowerAriaLabel.includes("bcc") && !lowerPlaceholder.includes("subject") && !lowerPlaceholder.includes("to") && !element.closest('[aria-label*="Subject"]') && !element.closest('[aria-label*="To"]') && !element.closest('[aria-label*="Cc"]') && !element.closest('[aria-label*="Bcc"]')) {
        console.log("Identified as body field via default contenteditable logic");
        return "body";
      }
    }
    const defaultType = element.tagName === "INPUT" ? "subject" : "body";
    console.log(`Identified as ${defaultType} field via fallback`);
    return defaultType;
  }
  setupContentObserver(element, inputData) {
    const observer = new MutationObserver((mutations) => {
      let hasChanges = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "characterData") {
          hasChanges = true;
        }
      });
      if (hasChanges) {
        const syntheticEvent = { target: element };
        this.handleInputEvent(syntheticEvent);
      }
    });
    observer.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });
    inputData.observer = observer;
  }
  handleInputEvent(event) {
    const element = event.target;
    const inputData = this.trackedInputs.get(element);
    if (!inputData) return;
    if (this.debounceTimers.has(element)) {
      clearTimeout(this.debounceTimers.get(element));
    }
    const timer = setTimeout(() => {
      this.checkGrammar(element);
    }, 1e3);
    this.debounceTimers.set(element, timer);
  }
  async checkGrammar(element) {
    if (this.isProcessing) return;
    const inputData = this.trackedInputs.get(element);
    if (!inputData) return;
    const text = this.getElementText(element);
    if (text === inputData.lastText) return;
    inputData.lastText = text;
    if (!text.trim()) {
      this.clearHighlights(element);
      return;
    }
    this.isProcessing = true;
    try {
      const issues = await this.analyzeText(text, inputData.type);
      inputData.currentIssues = issues;
      this.displayHighlights(element, issues);
    } catch (error) {
      console.error("Grammar analysis failed:", error);
    } finally {
      this.isProcessing = false;
    }
  }
  getElementText(element) {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      return element.value || "";
    }
    if (element.contentEditable === "true") {
      return element.textContent || element.innerText || "";
    }
    return "";
  }
  async analyzeText(text, inputType) {
    const issues = [];
    const rules = [
      // Grammar rules
      {
        pattern: /\bwould\s+of\b/gi,
        message: 'Use "would have" instead of "would of"',
        suggestions: ["would have"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\bshould\s+of\b/gi,
        message: 'Use "should have" instead of "should of"',
        suggestions: ["should have"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\bcould\s+of\b/gi,
        message: 'Use "could have" instead of "could of"',
        suggestions: ["could have"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\byour\s+welcome\b/gi,
        message: `Use "you're welcome" (you are welcome)`,
        suggestions: ["you're welcome"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\bits\s+a\s+nice\s+day\b/gi,
        message: `Use "it's" (it is) for contractions`,
        suggestions: ["it's a nice day"],
        type: "grammar",
        severity: "suggestion"
      },
      {
        pattern: /\bthere\s+house\b/gi,
        message: 'Use "their house" (possessive)',
        suggestions: ["their house"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\bto\s+many\b/gi,
        message: 'Use "too many" (excessive amount)',
        suggestions: ["too many"],
        type: "grammar",
        severity: "error"
      },
      {
        pattern: /\balot\b/gi,
        message: 'Use "a lot" (two words)',
        suggestions: ["a lot"],
        type: "spelling",
        severity: "error"
      },
      // Professional email suggestions
      {
        pattern: /\bkinda\b/gi,
        message: 'Consider using "kind of" in professional emails',
        suggestions: ["kind of", "somewhat"],
        type: "style",
        severity: "suggestion"
      },
      {
        pattern: /\bgonna\b/gi,
        message: 'Consider using "going to" in professional emails',
        suggestions: ["going to"],
        type: "style",
        severity: "suggestion"
      },
      {
        pattern: /\bwanna\b/gi,
        message: 'Consider using "want to" in professional emails',
        suggestions: ["want to"],
        type: "style",
        severity: "suggestion"
      },
      // Email-specific rules
      {
        pattern: /^hi$/gim,
        message: "Consider a more specific greeting",
        suggestions: ["Hi [Name]", "Hello", "Good morning"],
        type: "style",
        severity: "suggestion"
      }
    ];
    if (inputType === "subject") {
      rules.push({
        pattern: /^[a-z]/,
        message: "Subject lines should typically start with a capital letter",
        suggestions: [],
        type: "style",
        severity: "suggestion"
      });
    }
    rules.forEach((rule) => {
      rule.pattern.lastIndex = 0;
      let match;
      while ((match = rule.pattern.exec(text)) !== null) {
        issues.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          message: rule.message,
          suggestions: rule.suggestions,
          type: rule.type,
          severity: rule.severity,
          rule
        });
      }
    });
    return issues;
  }
  displayHighlights(element, issues) {
    this.clearHighlights(element);
    const inputData = this.trackedInputs.get(element);
    if (!inputData || !this.isElementVisible(element)) return;
    issues.forEach((issue) => {
      const highlight = this.createHighlight(element, issue);
      if (highlight) {
        inputData.highlights.push(highlight);
        this.highlightContainer.appendChild(highlight);
      }
    });
    console.log(`Created ${inputData.highlights.length} highlights for ${issues.length} issues`);
  }
  createHighlight(element, issue) {
    const position = this.calculateHighlightPosition(element, issue.start, issue.end);
    if (!position) return null;
    const highlight = document.createElement("div");
    highlight.className = `email-grammar-highlight ${issue.type} ${issue.severity}`;
    Object.assign(highlight.style, {
      position: "fixed",
      left: `${position.left}px`,
      top: `${position.top}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
      pointerEvents: "auto",
      cursor: "pointer",
      zIndex: "999999",
      backgroundColor: issue.severity === "error" ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 255, 0, 0.3)",
      borderBottom: issue.severity === "error" ? "2px solid red" : "2px solid orange",
      borderRadius: "2px"
    });
    highlight._issue = issue;
    highlight._element = element;
    highlight._position = position;
    highlight.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showSuggestionPopup(issue, highlight, element);
    });
    return highlight;
  }
  calculateHighlightPosition(element, start, end) {
    try {
      if (!this.isElementVisible(element)) return null;
      const elementRect = element.getBoundingClientRect();
      if (element.contentEditable === "true") {
        return this.getContentEditablePosition(element, start, end);
      } else {
        return this.getInputFieldPosition(element, start, end, elementRect);
      }
    } catch (error) {
      console.error("Error calculating highlight position:", error);
      return null;
    }
  }
  getContentEditablePosition(element, start, end) {
    try {
      const textNodes = this.getTextNodes(element);
      let currentPos = 0;
      for (const textNode of textNodes) {
        const nodeLength = textNode.textContent.length;
        if (currentPos + nodeLength >= start) {
          const range = document.createRange();
          const relativeStart = Math.max(0, start - currentPos);
          const relativeEnd = Math.min(nodeLength, end - currentPos);
          range.setStart(textNode, relativeStart);
          range.setEnd(textNode, relativeEnd);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return {
              left: rect.left,
              top: rect.top,
              width: Math.max(rect.width, 20),
              height: rect.height
            };
          }
        }
        currentPos += nodeLength;
        if (currentPos >= end) break;
      }
    } catch (error) {
      console.error("Error with contenteditable position:", error);
    }
    const elementRect = element.getBoundingClientRect();
    return {
      left: elementRect.left,
      top: elementRect.top,
      width: Math.min(100, elementRect.width),
      height: 20
    };
  }
  getInputFieldPosition(element, start, end, elementRect) {
    const measurer = document.createElement("div");
    const computedStyle = window.getComputedStyle(element);
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre-wrap;
      word-wrap: break-word;
      font: ${computedStyle.font};
      padding: ${computedStyle.padding};
      border: ${computedStyle.border};
      width: ${element.offsetWidth}px;
      top: -9999px;
      left: -9999px;
    `;
    document.body.appendChild(measurer);
    const text = this.getElementText(element);
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    measurer.textContent = beforeText;
    const beforeWidth = measurer.offsetWidth;
    measurer.textContent = beforeText + selectedText;
    const totalWidth = measurer.offsetWidth;
    const selectedWidth = Math.max(totalWidth - beforeWidth, 20);
    document.body.removeChild(measurer);
    const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;
    const paddingTop = parseInt(computedStyle.paddingTop) || 0;
    const lineHeight = parseInt(computedStyle.lineHeight) || 20;
    return {
      left: elementRect.left + paddingLeft + beforeWidth,
      top: elementRect.top + paddingTop,
      width: selectedWidth,
      height: lineHeight
    };
  }
  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }
    return textNodes;
  }
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(element);
    if (style.visibility === "hidden" || style.display === "none") return false;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    return !(rect.right < 0 || rect.left > viewport.width || rect.bottom < 0 || rect.top > viewport.height);
  }
  showSuggestionPopup(issue, highlight, element) {
    this.closeActivePopup();
    const popup = document.createElement("div");
    popup.className = "email-grammar-popup";
    const popupHeader = document.createElement("div");
    popupHeader.className = "popup-header";
    popupHeader.style.cssText = "display: flex; align-items: center; margin-bottom: 8px;";
    const issueIcon = document.createElement("span");
    issueIcon.className = "issue-icon";
    issueIcon.style.marginRight = "6px";
    issueIcon.textContent = issue.severity === "error" ? "❌" : "💡";
    const issueType = document.createElement("span");
    issueType.className = "issue-type";
    issueType.style.cssText = "font-weight: bold; color: #333;";
    issueType.textContent = issue.type.charAt(0).toUpperCase() + issue.type.slice(1);
    popupHeader.appendChild(issueIcon);
    popupHeader.appendChild(issueType);
    const popupMessage = document.createElement("div");
    popupMessage.className = "popup-message";
    popupMessage.style.cssText = "margin-bottom: 12px; color: #555;";
    popupMessage.textContent = issue.message;
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.className = "suggestions";
    suggestionsContainer.style.marginBottom = "12px";
    if (issue.suggestions && issue.suggestions.length > 0) {
      issue.suggestions.forEach((suggestion, index) => {
        const suggestionBtn = document.createElement("button");
        suggestionBtn.className = "suggestion-btn";
        suggestionBtn.textContent = suggestion;
        suggestionBtn.dataset.suggestion = suggestion;
        suggestionBtn.dataset.index = index;
        suggestionBtn.style.cssText = `
          display: block;
          width: 100%;
          margin: 4px 0;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f9f9f9;
          cursor: pointer;
          font-size: 13px;
        `;
        suggestionBtn.addEventListener("mouseenter", () => {
          suggestionBtn.style.background = "#e9e9e9";
        });
        suggestionBtn.addEventListener("mouseleave", () => {
          suggestionBtn.style.background = "#f9f9f9";
        });
        suggestionBtn.addEventListener("click", (e) => {
          const suggestion2 = e.target.dataset.suggestion;
          this.applySuggestion(element, issue, suggestion2);
          this.closeActivePopup();
        });
        suggestionsContainer.appendChild(suggestionBtn);
      });
    }
    const popupActions = document.createElement("div");
    popupActions.className = "popup-actions";
    popupActions.style.cssText = "display: flex; justify-content: flex-end; gap: 8px;";
    const ignoreBtn = document.createElement("button");
    ignoreBtn.className = "ignore-btn";
    ignoreBtn.textContent = "Ignore";
    ignoreBtn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 12px;
    `;
    ignoreBtn.addEventListener("mouseenter", () => {
      ignoreBtn.style.background = "#e5e5e5";
    });
    ignoreBtn.addEventListener("mouseleave", () => {
      ignoreBtn.style.background = "#f5f5f5";
    });
    ignoreBtn.addEventListener("click", () => {
      this.closeActivePopup();
    });
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 12px;
      font-weight: bold;
    `;
    closeBtn.addEventListener("mouseenter", () => {
      closeBtn.style.background = "#e5e5e5";
    });
    closeBtn.addEventListener("mouseleave", () => {
      closeBtn.style.background = "#f5f5f5";
    });
    closeBtn.addEventListener("click", () => {
      this.closeActivePopup();
    });
    popupActions.appendChild(ignoreBtn);
    popupActions.appendChild(closeBtn);
    popup.appendChild(popupHeader);
    popup.appendChild(popupMessage);
    if (suggestionsContainer.children.length > 0) {
      popup.appendChild(suggestionsContainer);
    }
    popup.appendChild(popupActions);
    popup.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      z-index: 1000000;
      line-height: 1.4;
    `;
    document.body.appendChild(popup);
    this.positionPopup(popup, highlight);
    this.activePopup = popup;
  }
  positionPopup(popup, highlight) {
    const highlightRect = highlight.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    let left = highlightRect.left;
    let top = highlightRect.bottom + 8;
    if (left + popupRect.width > viewport.width - 10) {
      left = Math.max(10, viewport.width - popupRect.width - 10);
    }
    if (top + popupRect.height > viewport.height - 10) {
      top = highlightRect.top - popupRect.height - 8;
      if (top < 10) {
        top = Math.max(10, viewport.height - popupRect.height - 10);
      }
    }
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  }
  applySuggestion(element, issue, suggestion) {
    try {
      if (element.contentEditable === "true") {
        this.applyToContentEditable(element, issue, suggestion);
      } else {
        this.applyToInputField(element, issue, suggestion);
      }
      setTimeout(() => this.checkGrammar(element), 500);
    } catch (error) {
      console.error("Error applying suggestion:", error);
    }
  }
  applyToContentEditable(element, issue, suggestion) {
    const text = this.getElementText(element);
    const newText = text.substring(0, issue.start) + suggestion + text.substring(issue.end);
    element.textContent = newText;
    try {
      const range = document.createRange();
      const selection = window.getSelection();
      const textNodes = this.getTextNodes(element);
      let currentPos = 0;
      const targetPos = issue.start + suggestion.length;
      for (const textNode of textNodes) {
        const nodeLength = textNode.textContent.length;
        if (currentPos + nodeLength >= targetPos) {
          const relativePos = targetPos - currentPos;
          range.setStart(textNode, Math.min(relativePos, nodeLength));
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          break;
        }
        currentPos += nodeLength;
      }
    } catch (e) {
      console.log("Could not set cursor position");
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.focus();
  }
  applyToInputField(element, issue, suggestion) {
    const value = element.value;
    const newValue = value.substring(0, issue.start) + suggestion + value.substring(issue.end);
    element.value = newValue;
    const newCursorPos = issue.start + suggestion.length;
    element.setSelectionRange(newCursorPos, newCursorPos);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.focus();
  }
  clearHighlights(element) {
    const inputData = this.trackedInputs.get(element);
    if (!inputData) return;
    inputData.highlights.forEach((highlight) => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    });
    inputData.highlights = [];
  }
  updateAllHighlights() {
    if (this.isScrolling) return;
    for (const [element, inputData] of this.trackedInputs) {
      if (!document.contains(element) || !this.isElementVisible(element)) {
        this.clearHighlights(element);
        continue;
      }
      inputData.highlights.forEach((highlight) => {
        const issue = highlight._issue;
        const newPosition = this.calculateHighlightPosition(element, issue.start, issue.end);
        if (newPosition) {
          Object.assign(highlight.style, {
            left: `${newPosition.left}px`,
            top: `${newPosition.top}px`,
            width: `${newPosition.width}px`,
            height: `${newPosition.height}px`
          });
        } else {
          if (highlight.parentNode) {
            highlight.parentNode.removeChild(highlight);
          }
        }
      });
      inputData.highlights = inputData.highlights.filter((h) => h.parentNode);
    }
  }
  throttledUpdateAllHighlights() {
    if (!this.isScrolling) {
      this.updateAllHighlights();
      return;
    }
    if (this.scrollThrottleTimer) return;
    this.scrollThrottleTimer = setTimeout(() => {
      this.updateAllHighlights();
      this.scrollThrottleTimer = null;
    }, 16);
  }
  findDialogContainer(element) {
    if (this.currentProvider === "gmail") {
      return element.closest('[role="dialog"]') || element.closest(".nH") || element.closest("[jscontroller]") || element.closest(".aO7");
    } else if (this.currentProvider === "outlook") {
      return element.closest('[data-app-section="ComposeContainer"]') || element.closest('[data-app-section="ComposeBody"]') || element.closest('[data-testid*="composer"]') || element.closest(".ms-FocusZone") || element.closest('[role="main"]');
    }
    return element.closest('[role="dialog"]') || element.closest(".compose-container") || element.closest(".modal");
  }
  showTemplateModal(element) {
    console.log("Showing template modal for element:", element);
    this.closeTemplateModal();
    const modal = document.createElement("div");
    modal.className = "email-template-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    const modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalHeader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    `;
    const headerTitle = document.createElement("h3");
    headerTitle.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    headerTitle.textContent = "Email Generation";
    const closeModalBtn = document.createElement("button");
    closeModalBtn.className = "close-modal-btn";
    closeModalBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
    closeModalBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeModalBtn.addEventListener("mouseenter", () => {
      closeModalBtn.style.background = "#f0f0f0";
    });
    closeModalBtn.addEventListener("mouseleave", () => {
      closeModalBtn.style.background = "none";
    });
    modalHeader.appendChild(headerTitle);
    modalHeader.appendChild(closeModalBtn);
    const modalBody = document.createElement("div");
    modalBody.className = "modal-body";
    const label = document.createElement("label");
    label.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    `;
    label.textContent = "What kind of email would you like to generate?";
    const textarea = document.createElement("textarea");
    textarea.className = "template-request-input";
    textarea.placeholder = "Example: Professional follow-up email after a job interview, thanking them for their time and reiterating my interest in the position";
    textarea.style.cssText = `
      width: 100%;
      min-height: 80px;
      padding: 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    `;
    textarea.addEventListener("focus", () => {
      textarea.style.borderColor = "#667eea";
    });
    textarea.addEventListener("blur", () => {
      textarea.style.borderColor = "#e1e5e9";
    });
    const suggestionsSection = document.createElement("div");
    suggestionsSection.className = "template-suggestions";
    suggestionsSection.style.margin = "16px 0";
    const suggestionsLabel = document.createElement("p");
    suggestionsLabel.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #666;
      font-weight: 500;
    `;
    suggestionsLabel.textContent = "Quick suggestions:";
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.style.cssText = "display: flex; flex-wrap: wrap; gap: 8px;";
    const suggestions = [
      "Professional thank you email after a meeting",
      "Polite follow-up email for a pending response",
      "Professional apology email for a mistake",
      "Introduction email to a new team member",
      "Request for a meeting or call",
      "Professional resignation letter"
    ];
    suggestions.forEach((suggestion) => {
      const chip = document.createElement("button");
      chip.className = "suggestion-chip";
      chip.textContent = suggestion.replace("Professional ", "").replace(" email", "").replace(" letter", "");
      chip.dataset.suggestion = suggestion;
      chip.style.cssText = `
        padding: 6px 12px;
        border: 1px solid #e1e5e9;
        border-radius: 20px;
        background: white;
        color: #666;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      `;
      chip.addEventListener("mouseenter", () => {
        chip.style.background = "#f0f4ff";
        chip.style.borderColor = "#667eea";
        chip.style.color = "#667eea";
      });
      chip.addEventListener("mouseleave", () => {
        chip.style.background = "white";
        chip.style.borderColor = "#e1e5e9";
        chip.style.color = "#666";
      });
      chip.addEventListener("click", () => {
        textarea.value = suggestion;
        textarea.focus();
      });
      suggestionsContainer.appendChild(chip);
    });
    suggestionsSection.appendChild(suggestionsLabel);
    suggestionsSection.appendChild(suggestionsContainer);
    const modalActions = document.createElement("div");
    modalActions.className = "modal-actions";
    modalActions.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    `;
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "cancel-btn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      padding: 10px 20px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    `;
    cancelBtn.addEventListener("mouseenter", () => {
      cancelBtn.style.background = "#f5f5f5";
    });
    cancelBtn.addEventListener("mouseleave", () => {
      cancelBtn.style.background = "white";
    });
    const generateBtn = document.createElement("button");
    generateBtn.className = "generate-btn";
    generateBtn.style.cssText = `
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: #346FC7;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      min-width: 100px;
    `;
    generateBtn.addEventListener("mouseenter", () => {
      generateBtn.style.transform = "translateY(-1px)";
    });
    generateBtn.addEventListener("mouseleave", () => {
      generateBtn.style.transform = "translateY(0)";
    });
    const btnText = document.createElement("span");
    btnText.className = "btn-text";
    btnText.textContent = "Generate";
    const btnLoading = document.createElement("span");
    btnLoading.className = "btn-loading";
    btnLoading.style.display = "none";
    btnLoading.innerHTML = `
      <span style="
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff40;
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></span>
    `;
    generateBtn.appendChild(btnText);
    generateBtn.appendChild(btnLoading);
    modalActions.appendChild(cancelBtn);
    modalActions.appendChild(generateBtn);
    modalBody.appendChild(label);
    modalBody.appendChild(textarea);
    modalBody.appendChild(suggestionsSection);
    modalBody.appendChild(modalActions);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
    this.activeTemplateModal = modal;
    console.log("Modal created and added to DOM");
    this.setupTemplateModalListeners(modal, element, textarea, generateBtn, cancelBtn, closeModalBtn);
    setTimeout(() => {
      textarea.focus();
      console.log("Input focused");
    }, 100);
  }
  setupTemplateModalListeners(modal, element, input, generateBtn, cancelBtn, closeBtn) {
    generateBtn.addEventListener("click", () => {
      const request = input.value.trim();
      if (request) {
        this.generateEmailTemplate(request, element, generateBtn);
      }
    });
    [cancelBtn, closeBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closeTemplateModal();
      });
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const request = input.value.trim();
        if (request) {
          this.generateEmailTemplate(request, element, generateBtn);
        }
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeTemplateModal();
      }
    });
    const escapeHandler = (e) => {
      if (e.key === "Escape" && this.activeTemplateModal) {
        this.closeTemplateModal();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }
  async generateEmailTemplate(request, element, generateBtn) {
    const btnText = generateBtn.querySelector(".btn-text");
    const btnLoading = generateBtn.querySelector(".btn-loading");
    btnText.style.display = "none";
    btnLoading.style.display = "inline-block";
    generateBtn.disabled = true;
    generateBtn.style.cursor = "not-allowed";
    const prompt = `Generate a professional email based on this request: "${request}"

      Format the email exactly like this example structure:

      Dear [Name],

      [Opening paragraph establishing purpose]

      [Main content paragraph 1]

      [Additional paragraphs as needed]

      [Closing paragraph]

      Best regards,
      [Name]

      Requirements:
      - Professional tone throughout
      - Concise but comprehensive
      - No subject line needed
      - Replace bracketed sections with actual content

      Email:`;
    chrome.runtime.sendMessage({ action: "EMAIL_GENERATION", prompt }, (response) => {
      btnText.style.display = "inline-block";
      btnLoading.style.display = "none";
      generateBtn.disabled = false;
      generateBtn.style.cursor = "pointer";
      if (!response.success) {
        console.error("Error generating template:", response.error);
        this.showNotification(response.error, "error");
        return;
      }
      this.insertTemplate(element, response.data);
      this.closeTemplateModal();
      this.showNotification("Email template generated successfully! ✨", "success");
    });
  }
  htmlToPlainText(html) {
    return html.replace(/<\/p>/g, "\n\n").replace(/<p>/g, "").replace(/<br\s*\/?>/g, "\n").replace(/<\/div>/g, "\n").replace(/<div>/g, "").replace(/<[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  insertTemplate(element, template) {
    try {
      if (element.contentEditable === "true") {
        element.innerHTML = template;
        element.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
        element.value = this.htmlToPlainText(template);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
      element.focus();
      setTimeout(() => this.checkGrammar(element), 1e3);
    } catch (error) {
      console.error("Error inserting template:", error);
    }
  }
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3e3);
  }
  hideHighlightsDuringScroll() {
    if (this.highlightContainer) {
      this.highlightContainer.style.opacity = "0";
      this.highlightContainer.style.pointerEvents = "none";
    }
    this.closeActivePopup();
  }
  closeTemplateModal() {
    if (this.activeTemplateModal && this.activeTemplateModal.parentNode) {
      this.activeTemplateModal.parentNode.removeChild(this.activeTemplateModal);
      this.activeTemplateModal = null;
    }
  }
  showHighlightsAfterScroll() {
    if (this.highlightContainer) {
      this.updateAllHighlights();
      this.highlightContainer.style.opacity = "1";
      this.highlightContainer.style.pointerEvents = "none";
      const highlights = this.highlightContainer.querySelectorAll(".email-grammar-highlight");
      highlights.forEach((highlight) => {
        highlight.style.pointerEvents = "auto";
      });
    }
  }
  handleScrollStart() {
    this.isScrolling = true;
    this.hideHighlightsDuringScroll();
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
  }
  handleScrollEnd() {
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false;
      this.showHighlightsAfterScroll();
    }, 150);
  }
  closeActivePopup() {
    if (this.activePopup && this.activePopup.parentNode) {
      this.activePopup.parentNode.removeChild(this.activePopup);
      this.activePopup = null;
    }
  }
  setupGlobalEventListeners() {
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".email-grammar-popup") && !e.target.closest(".email-grammar-highlight")) {
        this.closeActivePopup();
      }
    });
    const handleScrollStart = () => {
      if (!this.isScrolling) {
        this.handleScrollStart();
      }
      this.handleScrollEnd();
    };
    window.addEventListener("scroll", handleScrollStart, { passive: true });
    document.addEventListener("wheel", handleScrollStart, { passive: true });
    document.addEventListener("touchmove", handleScrollStart, { passive: true });
    let resizeTimeout;
    window.addEventListener("resize", () => {
      this.closeActivePopup();
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!this.isScrolling) {
          this.updateAllHighlights();
        }
      }, 100);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeActivePopup();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.closeActivePopup();
      } else {
        setTimeout(() => {
          if (!this.isScrolling) {
            this.updateAllHighlights();
          }
        }, 200);
      }
    });
    if (this.currentProvider === "outlook") {
      const outlookSelectors = [
        '[data-app-section="ComposeBody"]',
        ".ms-FocusZone",
        '[role="main"]',
        ".scrollable-pane",
        ".ms-ScrollablePane--contentContainer"
      ];
      outlookSelectors.forEach((selector) => {
        setTimeout(() => {
          const containers = document.querySelectorAll(selector);
          containers.forEach((container) => {
            container.addEventListener("scroll", handleScrollStart, { passive: true });
          });
        }, 1e3);
      });
    }
    const originalScrollTo = window.scrollTo;
    const originalScrollBy = window.scrollBy;
    window.scrollTo = function(...args) {
      handleScrollStart();
      return originalScrollTo.apply(window, args);
    };
    window.scrollBy = function(...args) {
      handleScrollStart();
      return originalScrollBy.apply(window, args);
    };
  }
  cleanup() {
    if (this.highlightContainer && this.highlightContainer.parentNode) {
      this.highlightContainer.parentNode.removeChild(this.highlightContainer);
    }
    if (this.floatingActionButton && this.floatingActionButton.parentNode) {
      this.floatingActionButton.parentNode.removeChild(this.floatingActionButton);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.closeActivePopup();
    this.closeTemplateModal();
    for (const [element, inputData] of this.trackedInputs) {
      if (inputData.observer) {
        inputData.observer.disconnect();
      }
      this.clearHighlights(element);
    }
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.typingTimers.values()) {
      clearTimeout(timer);
    }
    if (this.scrollThrottleTimer) {
      clearTimeout(this.scrollThrottleTimer);
    }
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
    if (this.fabVisibilityTimer) {
      clearTimeout(this.fabVisibilityTimer);
    }
    this.trackedInputs.clear();
    this.debounceTimers.clear();
    this.typingTimers.clear();
    this.dialogObservers.clear();
  }
}
function initEmailGrammarChecker() {
  if (window.emailGrammarChecker) {
    window.emailGrammarChecker.cleanup();
  }
  try {
    window.emailGrammarChecker = new EmailGrammarChecker();
    console.log("Email Grammar Checker initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Email Grammar Checker:", error);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmailGrammarChecker);
} else {
  initEmailGrammarChecker();
}
setTimeout(initEmailGrammarChecker, 2e3);
setTimeout(initEmailGrammarChecker, 5e3);
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onConnect?.addListener(() => {
    initEmailGrammarChecker();
  });
}
