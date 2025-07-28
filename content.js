document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    console.log("Mouseup detected. Selected text:", selectedText);

    // Optional: Send selected text to your side panel or background script
    chrome.runtime.sendMessage({
      action: "selectionDetected",
      text: selectedText
    });
  }
});

// Grammar Assistant Content Script
class GrammarAssistant {
  constructor() {
    this.highlightContainer = null;
    this.activePopup = null;
    this.inputElements = new WeakMap();
    this.debounceTimers = new WeakMap();
    this.highlights = new WeakMap();
    // Add a Set to track all input elements for iteration
    this.trackedInputs = new Set();
    
    this.init();
  }

  init() {
    this.createHighlightContainer();
    this.setupInputMonitoring();
    this.setupGlobalEventListeners();
  }

  createHighlightContainer() {
    this.highlightContainer = document.createElement('div');
    this.highlightContainer.id = 'grammar-highlight-container';
    this.highlightContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.highlightContainer);
  }

  setupInputMonitoring() {
    // Monitor existing inputs
    this.scanForInputs();
    
    // Watch for dynamically added inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanForInputsInElement(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForInputs() {
    this.scanForInputsInElement(document);
  }

  scanForInputsInElement(element) {
    const inputs = element.querySelectorAll('input[type="text"], input[type="email"], textarea, [contenteditable="true"]');
    inputs.forEach(input => this.attachToInput(input));
  }

  attachToInput(input) {
    if (this.inputElements.has(input)) return;
    
    this.inputElements.set(input, {
      lastValue: '',
      highlights: []
    });

    // Add to tracked inputs Set
    this.trackedInputs.add(input);

    // Add event listeners
    input.addEventListener('input', (e) => this.handleInput(e));
    input.addEventListener('blur', (e) => this.handleBlur(e));
    input.addEventListener('focus', (e) => this.handleFocus(e));
    input.addEventListener('scroll', (e) => this.updateHighlightPositions(e.target));
  }

  handleInput(event) {
    const input = event.target;
    const data = this.inputElements.get(input);
    
    if (!data) return;

    // Clear existing timer
    if (this.debounceTimers.has(input)) {
      clearTimeout(this.debounceTimers.get(input));
    }

    // Debounce grammar checking
    const timer = setTimeout(() => {
      this.checkGrammar(input);
    }, 500);
    
    this.debounceTimers.set(input, timer);
  }

  handleFocus(event) {
    this.updateHighlightPositions(event.target);
  }

  handleBlur(event) {
    // Keep highlights visible even when input loses focus
    // This allows users to click on suggestions
  }

  async checkGrammar(input) {
    const text = this.getInputText(input);
    if (!text.trim()) {
      this.clearHighlights(input);
      return;
    }

    try {
      const issues = await this.analyzeGrammar(text);
      this.displayHighlights(input, issues);
    } catch (error) {
      console.error('Grammar check failed:', error);
    }
  }

  getInputText(input) {
    if (input.contentEditable === 'true') {
      return input.textContent || '';
    }
    return input.value || '';
  }

  async analyzeGrammar(text) {
    // Simple grammar rules for demonstration
    // In production, you'd use a proper grammar API
    const issues = [];
    
    // Common grammar issues
    const rules = [
      {
        pattern: /\bthere\s+house\b/gi,
        message: 'Did you mean "their house"?',
        suggestions: ['their house']
      },
      {
        pattern: /\byour\s+welcome\b/gi,
        message: 'Did you mean "you\'re welcome"?',
        suggestions: ["you're welcome"]
      },
      {
        pattern: /\bits\s+a\s+nice\s+day\b/gi,
        message: 'Consider: "it\'s a nice day"',
        suggestions: ["it's a nice day"]
      },
      {
        pattern: /\bto\s+many\b/gi,
        message: 'Did you mean "too many"?',
        suggestions: ['too many']
      },
      {
        pattern: /\bwould\s+of\b/gi,
        message: 'Did you mean "would have"?',
        suggestions: ['would have']
      },
      {
        pattern: /\bshould\s+of\b/gi,
        message: 'Did you mean "should have"?',
        suggestions: ['should have']
      },
      {
        pattern: /\bcould\s+of\b/gi,
        message: 'Did you mean "could have"?',
        suggestions: ['could have']
      }
    ];

    rules.forEach(rule => {
      let match;
      while ((match = rule.pattern.exec(text)) !== null) {
        issues.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          message: rule.message,
          suggestions: rule.suggestions,
          type: 'grammar'
        });
      }
    });

    return issues;
  }

  displayHighlights(input, issues) {
    this.clearHighlights(input);
    
    const data = this.inputElements.get(input);
    if (!data) return;

    issues.forEach(issue => {
      const highlight = this.createHighlight(input, issue);
      data.highlights.push(highlight);
      this.highlightContainer.appendChild(highlight);
    });
  }

  createHighlight(input, issue) {
    const highlight = document.createElement('div');
    highlight.classList.add('grammar-highlight');
    highlight.style.cssText = `
      position: absolute;
      background-color: rgba(255, 0, 0, 0.3);
      border-bottom: 2px wavy red;
      pointer-events: auto;
      cursor: pointer;
    `;
    
    // Calculate position
    const position = this.calculateTextPosition(input, issue.start, issue.end);
    if (position) {
      highlight.style.left = position.left + 'px';
      highlight.style.top = position.top + 'px';
      highlight.style.width = position.width + 'px';
      highlight.style.height = position.height + 'px';
    }

    // Add click listener
    highlight.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showSuggestionPopup(issue, highlight, input);
    });

    return highlight;
  }

  calculateTextPosition(input, start, end) {
    try {
      const inputRect = input.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (input.contentEditable === 'true') {
        return this.getContentEditablePosition(input, start, end, inputRect, scrollLeft, scrollTop);
      } else {
        return this.getInputPosition(input, start, end, inputRect, scrollLeft, scrollTop);
      }
    } catch (error) {
      console.error('Error calculating text position:', error);
      return null;
    }
  }

  getInputPosition(input, start, end, inputRect, scrollLeft, scrollTop) {
    // Create a temporary div to measure text
    const measurer = document.createElement('div');
    measurer.style.cssText = `
      position: absolute;
      visibility: hidden;
      white-space: pre;
      font: ${window.getComputedStyle(input).font};
      padding: ${window.getComputedStyle(input).padding};
      border: ${window.getComputedStyle(input).border};
      width: ${input.offsetWidth}px;
    `;
    
    document.body.appendChild(measurer);
    
    const text = input.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    
    // Measure text before selection
    measurer.textContent = beforeText;
    const beforeWidth = measurer.offsetWidth;
    
    // Measure selected text
    measurer.textContent = beforeText + selectedText;
    const totalWidth = measurer.offsetWidth;
    const selectedWidth = totalWidth - beforeWidth;
    
    document.body.removeChild(measurer);
    
    // Calculate position
    const computedStyle = window.getComputedStyle(input);
    const paddingLeft = parseInt(computedStyle.paddingLeft);
    const paddingTop = parseInt(computedStyle.paddingTop);
    
    return {
      left: inputRect.left + scrollLeft + paddingLeft + beforeWidth,
      top: inputRect.top + scrollTop + paddingTop,
      width: selectedWidth,
      height: parseInt(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.2
    };
  }

  getContentEditablePosition(input, start, end, inputRect, scrollLeft, scrollTop) {
    const range = document.createRange();
    const textNode = this.getTextNodeAtPosition(input, start);
    
    if (!textNode) return null;
    
    const nodeStart = this.getTextNodeStart(input, textNode);
    const relativeStart = start - nodeStart;
    const relativeEnd = Math.min(end - nodeStart, textNode.textContent.length);
    
    range.setStart(textNode, relativeStart);
    range.setEnd(textNode, relativeEnd);
    
    const rect = range.getBoundingClientRect();
    
    return {
      left: rect.left + scrollLeft,
      top: rect.top + scrollTop,
      width: rect.width,
      height: rect.height
    };
  }

  getTextNodeAtPosition(element, position) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentPos = 0;
    let node;
    
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentPos + nodeLength >= position) {
        return node;
      }
      currentPos += nodeLength;
    }
    
    return null;
  }

  getTextNodeStart(element, targetNode) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentPos = 0;
    let node;
    
    while (node = walker.nextNode()) {
      if (node === targetNode) {
        return currentPos;
      }
      currentPos += node.textContent.length;
    }
    
    return 0;
  }

  showSuggestionPopup(issue, highlight, input) {
    this.closeActivePopup();
    
    const popup = document.createElement('div');
    popup.classList.add('grammar-popup');
    popup.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 200px;
    `;
    
    // Add issue message
    const message = document.createElement('div');
    message.classList.add('grammar-message');
    message.style.cssText = `
      margin-bottom: 8px;
      font-size: 12px;
      color: #666;
    `;
    message.textContent = issue.message;
    popup.appendChild(message);
    
    // Add suggestions
    const suggestionsList = document.createElement('div');
    suggestionsList.classList.add('grammar-suggestions');
    
    issue.suggestions.forEach(suggestion => {
      const button = document.createElement('button');
      button.classList.add('grammar-suggestion-btn');
      button.style.cssText = `
        display: block;
        width: 100%;
        padding: 4px 8px;
        margin: 2px 0;
        border: 1px solid #ddd;
        background: #f9f9f9;
        cursor: pointer;
        border-radius: 2px;
        font-size: 12px;
      `;
      button.textContent = suggestion;
      button.addEventListener('click', () => {
        this.applySuggestion(input, issue, suggestion);
        this.closeActivePopup();
      });
      button.addEventListener('mouseover', () => {
        button.style.background = '#e9e9e9';
      });
      button.addEventListener('mouseout', () => {
        button.style.background = '#f9f9f9';
      });
      suggestionsList.appendChild(button);
    });
    
    popup.appendChild(suggestionsList);
    
    // Add ignore button
    const ignoreBtn = document.createElement('button');
    ignoreBtn.classList.add('grammar-ignore-btn');
    ignoreBtn.style.cssText = `
      display: block;
      width: 100%;
      padding: 4px 8px;
      margin: 4px 0 0 0;
      border: 1px solid #ddd;
      background: #f0f0f0;
      cursor: pointer;
      border-radius: 2px;
      font-size: 12px;
    `;
    ignoreBtn.textContent = 'Ignore';
    ignoreBtn.addEventListener('click', () => {
      this.closeActivePopup();
    });
    popup.appendChild(ignoreBtn);
    
    // Position popup
    const highlightRect = highlight.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    popup.style.left = (highlightRect.left + scrollLeft) + 'px';
    popup.style.top = (highlightRect.bottom + scrollTop + 5) + 'px';
    
    document.body.appendChild(popup);
    this.activePopup = popup;
    
    // Adjust position if popup goes off screen
    setTimeout(() => {
      const popupRect = popup.getBoundingClientRect();
      if (popupRect.right > window.innerWidth) {
        popup.style.left = (window.innerWidth - popupRect.width - 10 + scrollLeft) + 'px';
      }
      if (popupRect.bottom > window.innerHeight) {
        popup.style.top = (highlightRect.top + scrollTop - popupRect.height - 5) + 'px';
      }
    }, 0);
  }

  applySuggestion(input, issue, suggestion) {
    if (input.contentEditable === 'true') {
      this.applySuggestionToContentEditable(input, issue, suggestion);
    } else {
      this.applySuggestionToInput(input, issue, suggestion);
    }
    
    // Recheck grammar after applying suggestion
    setTimeout(() => this.checkGrammar(input), 100);
  }

  applySuggestionToInput(input, issue, suggestion) {
    const value = input.value;
    const newValue = value.substring(0, issue.start) + suggestion + value.substring(issue.end);
    input.value = newValue;
    
    // Trigger input event to notify any listeners
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  applySuggestionToContentEditable(input, issue, suggestion) {
    const text = input.textContent;
    const newText = text.substring(0, issue.start) + suggestion + text.substring(issue.end);
    input.textContent = newText;
    
    // Trigger input event
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  clearHighlights(input) {
    const data = this.inputElements.get(input);
    if (!data) return;
    
    data.highlights.forEach(highlight => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    });
    
    data.highlights = [];
  }

  updateHighlightPositions(input) {
    const data = this.inputElements.get(input);
    if (!data) return;
    
    // For simplicity, just recheck grammar to update positions
    setTimeout(() => this.checkGrammar(input), 50);
  }

  closeActivePopup() {
    if (this.activePopup && this.activePopup.parentNode) {
      this.activePopup.parentNode.removeChild(this.activePopup);
      this.activePopup = null;
    }
  }

  setupGlobalEventListeners() {
    // Close popup when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.grammar-popup') && !e.target.closest('.grammar-highlight')) {
        this.closeActivePopup();
      }
    });
    
    // Update positions on scroll and resize - Fixed to use Set iteration
    window.addEventListener('scroll', () => {
      for (const input of this.trackedInputs) {
        if (document.contains(input)) {
          this.updateHighlightPositions(input);
        } else {
          // Clean up removed elements
          this.trackedInputs.delete(input);
        }
      }
    });
    
    window.addEventListener('resize', () => {
      for (const input of this.trackedInputs) {
        if (document.contains(input)) {
          this.updateHighlightPositions(input);
        } else {
          // Clean up removed elements
          this.trackedInputs.delete(input);
        }
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GrammarAssistant();
  });
} else {
  new GrammarAssistant();
}

