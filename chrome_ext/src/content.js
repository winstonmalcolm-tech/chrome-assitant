// Email Grammar Checker Content Script - CSP Compliant with Floating Action Button
class EmailGrammarChecker {
  constructor() {
    this.floatingActionButton = null;
    this.activeTemplateModal = null;
    this.currentProvider = this.detectEmailProvider();
    this.fabVisibilityTimer = null;

    this.init();
  }

  detectEmailProvider() {
    const hostname = window.location.hostname;
    if (hostname.includes('gmail') || hostname.includes('mail.google')) {
      return 'gmail';
    } else if (hostname.includes('outlook')) {
      return 'outlook';
    } else if (hostname.includes('yahoo')) {
      return 'yahoo';
    }
    return 'unknown';
  }

  init() {
    this.createFloatingActionButton();
    this.startFabVisibilityMonitoring();
  }

  sanitizeUserInput(input) {
    // Remove script/style tags, HTML tags, and trim whitespace
    let sanitized = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
                        .replace(/<\/?[^>]+(>|$)/g, '')
                        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width chars
                        .trim();
    // Optionally, escape special HTML characters
    sanitized = sanitized.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
    return sanitized;
  }

  createFloatingActionButton() {
    // Remove existing FAB if it exists
    if (this.floatingActionButton && this.floatingActionButton.parentNode) {
      this.floatingActionButton.parentNode.removeChild(this.floatingActionButton);
    }

    const fab = document.createElement('button');
    fab.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: 600; font-size: 14px;">Generate Email</span>
      </div>
    `;
    fab.className = 'email-ai-fab';
    fab.type = 'button';

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

    // Hover effects
    fab.addEventListener('mouseenter', () => {
      if (fab.style.visibility !== 'hidden') {
        fab.style.transform = 'translateY(0) scale(1.05)';
        fab.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
      }
    });

    fab.addEventListener('mouseleave', () => {
      if (fab.style.visibility !== 'hidden') {
        fab.style.transform = 'translateY(0) scale(1)';
        fab.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
      }
    });

    // Click handler
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        let composeElement = this.findReplyBox();
        let isReply = !!composeElement;
        if (!composeElement) {
          composeElement = this.findComposeArea();
        }
        if (composeElement) {
          this.showTemplateModal(composeElement, isReply);
        } else {
          this.showNotification('Please click into the email compose area first.', 'error');
        }
      } catch (error) {
        console.error('Error showing template modal from FAB:', error);
      }
    });

    document.body.appendChild(fab);
    this.floatingActionButton = fab;
  }

  // Add this method to your class:
  findComposeArea() {
    // Gmail
    if (this.currentProvider === 'gmail') {
      return document.querySelector('[role="dialog"]:not([aria-hidden="true"]) .Am.Al.editable, .nH[role="dialog"]:not([aria-hidden="true"]) .Am.Al.editable');
    }
    // Outlook
    if (this.currentProvider === 'outlook') {
      // Find all visible contenteditable elements
      const candidates = Array.from(document.querySelectorAll('div[contenteditable="true"]'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return el.offsetParent !== null && rect.width > 200 && rect.height > 50;
        });
      // Return the largest one (most likely the body)
      let largest = null, maxArea = 0;
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          largest = el;
        }
      }
      return largest;
    }
    // Yahoo
    if (this.currentProvider === 'yahoo') {
      return document.querySelector('.compose-container:not([aria-hidden="true"]) div[contenteditable="true"]');
    }
    // Generic fallback
    return document.querySelector('div[contenteditable="true"], textarea');
  }

  // Add this method to detect if a compose box is open
  // ...inside your class...
  isComposeBoxOpen() {
    // Check for new compose
    let found = false;
    if (this.currentProvider === 'gmail') {
      found = !!document.querySelector('[role="dialog"]:not([aria-hidden="true"]) .Am.Al.editable, .nH[role="dialog"]:not([aria-hidden="true"]) .Am.Al.editable');
      // Also check for reply box
      if (!found) {
        found = !!document.querySelector('div[aria-label="Message Body"]:not([aria-hidden="true"])');
      }
      return found;
    }
    if (this.currentProvider === 'outlook') {
      found = !!document.querySelector('div[contenteditable="true"][aria-label*="Message body"], div[contenteditable="true"][role="textbox"]');
      // Also check for reply box in reading pane
      if (!found) {
        const candidates = Array.from(document.querySelectorAll('div[contenteditable="true"]'))
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return el.offsetParent !== null && rect.width > 200 && rect.height > 50 &&
              el.closest('[data-app-section="ReadingPane"]');
          });
        found = candidates.length > 0;
      }
      return found;
    }
    if (this.currentProvider === 'yahoo') {
      found = !!document.querySelector('.compose-container:not([aria-hidden="true"]) div[contenteditable="true"]');
      // Add reply detection for Yahoo if needed
      return found;
    }
    // Generic fallback
    return !!document.querySelector('div[contenteditable="true"], textarea');
  }

  startFabVisibilityMonitoring() {
    // Check FAB visibility periodically
    const checkFabVisibility = () => {
      const shouldShow = this.isComposeBoxOpen();
      this.updateFabVisibility(shouldShow);
    };

    setTimeout(checkFabVisibility, 1000);
    setInterval(checkFabVisibility, 2000);
  }


  updateFabVisibility(shouldShow) {
    if (!this.floatingActionButton) return;

    const isCurrentlyVisible = this.floatingActionButton.style.visibility !== 'hidden' &&
      this.floatingActionButton.style.opacity !== '0';

    if (shouldShow && !isCurrentlyVisible) {
      // Show FAB with animation
      this.floatingActionButton.style.visibility = 'visible';
      this.floatingActionButton.style.display = 'flex';
      this.floatingActionButton.offsetHeight;
      requestAnimationFrame(() => {
        this.floatingActionButton.style.opacity = '1';
        this.floatingActionButton.style.transform = 'translateY(0) scale(1)';
      });
    } else if (!shouldShow && isCurrentlyVisible) {
      // Hide FAB with animation
      this.floatingActionButton.style.opacity = '0';
      this.floatingActionButton.style.transform = 'translateY(100px) scale(0.8)';
      setTimeout(() => {
        if (this.floatingActionButton) {
          this.floatingActionButton.style.visibility = 'hidden';
          this.floatingActionButton.style.display = 'none';
        }
      }, 300);
    }
  }

  showTemplateModal(element, isReply = false) {
    this.closeTemplateModal();

    const modal = document.createElement('div');
    modal.className = 'email-template-modal';

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

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
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

    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    `;

    const headerTitleContainer = document.createElement('div');
    headerTitleContainer.style.display = 'flex';
    headerTitleContainer.style.alignItems = 'center';
    headerTitleContainer.style.gap = '2px';

    const headerTitle = document.createElement('h3');
    headerTitle.textContent = "Email Template Generator";
    headerTitle.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const iconUrl = chrome.runtime.getURL("alinea_icon.png");

    const headerImg = document.createElement('img');
    headerImg.id = 'alinea-header-img';
    headerImg.src = iconUrl
    headerImg.alt = 'icon';
    headerImg.style.width = '50px';
    headerImg.style.height = '40px';

    headerTitleContainer.appendChild(headerImg);
    headerTitleContainer.appendChild(headerTitle);

    const closeModalBtn = document.createElement('button');
    closeModalBtn.className = 'close-modal-btn';
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

    closeModalBtn.addEventListener('mouseenter', () => {
      closeModalBtn.style.background = '#f0f0f0';
    });
    closeModalBtn.addEventListener('mouseleave', () => {
      closeModalBtn.style.background = 'none';
    });

    modalHeader.appendChild(headerTitleContainer);
    modalHeader.appendChild(closeModalBtn);

    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const label = document.createElement('label');
    label.style.cssText = `
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    `;
    label.textContent = 'What kind of email would you like to generate?';

    const textarea = document.createElement('textarea');
    textarea.className = 'template-request-input';
    textarea.placeholder = 'Example: Professional follow-up email after a job interview, thanking them for their time and reiterating my interest in the position';
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

    textarea.addEventListener('focus', () => {
      textarea.style.borderColor = '#667eea';
    });
    textarea.addEventListener('blur', () => {
      textarea.style.borderColor = '#e1e5e9';
    });

    // Create suggestions section
    const suggestionsSection = document.createElement('div');
    suggestionsSection.className = 'template-suggestions';
    suggestionsSection.style.margin = '16px 0';

    const suggestionsLabel = document.createElement('p');
    suggestionsLabel.style.cssText = `
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #666;
      font-weight: 500;
    `;
    suggestionsLabel.textContent = 'Quick suggestions:';

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';

    const suggestions = [
      'Professional thank you email after a meeting',
      'Polite follow-up email for a pending response',
      'Professional apology email for a mistake',
      'Introduction email to a new team member',
      'Request for a meeting or call',
      'Professional resignation letter'
    ];

    suggestions.forEach(suggestion => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.textContent = suggestion.replace('Professional ', '').replace(' email', '').replace(' letter', '');
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

      chip.addEventListener('mouseenter', () => {
        chip.style.background = '#f0f4ff';
        chip.style.borderColor = '#667eea';
        chip.style.color = '#667eea';
      });
      chip.addEventListener('mouseleave', () => {
        chip.style.background = 'white';
        chip.style.borderColor = '#e1e5e9';
        chip.style.color = '#666';
      });
      chip.addEventListener('click', () => {
        textarea.value = suggestion;
        textarea.focus();
      });

      suggestionsContainer.appendChild(chip);
    });

    suggestionsSection.appendChild(suggestionsLabel);
    suggestionsSection.appendChild(suggestionsContainer);

    // Create modal actions
    const modalActions = document.createElement('div');
    modalActions.className = 'modal-actions';
    modalActions.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    `;

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
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

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.background = '#f5f5f5';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.background = 'white';
    });

    const generateBtn = document.createElement('button');
    generateBtn.className = 'generate-btn';
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

    generateBtn.addEventListener('mouseenter', () => {
      generateBtn.style.transform = 'translateY(-1px)';
    });
    generateBtn.addEventListener('mouseleave', () => {
      generateBtn.style.transform = 'translateY(0)';
    });

    const btnText = document.createElement('span');
    btnText.className = 'btn-text';
    btnText.textContent = 'Generate';

    const btnLoading = document.createElement('span');
    btnLoading.className = 'btn-loading';
    btnLoading.style.display = 'none';
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

    // Assemble modal body
    modalBody.appendChild(label);
    modalBody.appendChild(textarea);
    modalBody.appendChild(suggestionsSection);
    modalBody.appendChild(modalActions);

    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);

    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);
    this.activeTemplateModal = modal;

    // Setup event listeners
    this.setupTemplateModalListeners(modal, element, textarea, generateBtn, cancelBtn, closeModalBtn, isReply);

    // Focus the input
    setTimeout(() => {
      textarea.focus();
    }, 100);
  }

  setupTemplateModalListeners(modal, element, input, generateBtn, cancelBtn, closeBtn, isReply = false) {
    // Generate button
    generateBtn.addEventListener('click', () => {
      const request = input.value.trim();
      if (request) {
        this.generateEmailTemplate(request, element, generateBtn, isReply);
      }
    });

    // Cancel/Close buttons
    [cancelBtn, closeBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeTemplateModal();
      });
    });

    // Enter key to generate
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const request = input.value.trim();
        if (request) {
          this.generateEmailTemplate(request, element, generateBtn, isReply);
        }
      }
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeTemplateModal();
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape' && this.activeTemplateModal) {
        this.closeTemplateModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  async generateEmailTemplate(request, element, generateBtn, isReply = false) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    generateBtn.disabled = true;
    generateBtn.style.cursor = 'not-allowed';

    let prompt;
    if (isReply) {
      prompt = `Generate a professional reply email based on this request: "${request}"

        Format the reply as a professional response to the previous message.
        Do not include a subject line.
        Do not include quoted text.
        Use a professional tone and sign off appropriately.

        Email:`;
    } else {
      prompt = `Generate a professional email based on this request: "${request}"

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
    }

    chrome.runtime.sendMessage({action: "EMAIL_GENERATION", prompt: prompt}, (response) => {
      btnText.style.display = 'inline-block';
      btnLoading.style.display = 'none';
      generateBtn.disabled = false;
      generateBtn.style.cursor = 'pointer';

      if (!response.success) {
        console.error('Error generating template:', response.error);
        this.showNotification(response.error, 'error');
        return;
      }

      this.insertTemplate(element, response.data);
      this.closeTemplateModal();

      // Show success message
      this.showNotification('Email template generated successfully! ✨', 'success');
    });
  }


  findReplyBox() {
    if (this.currentProvider === 'gmail') {
      // Gmail reply boxes are usually not in a modal dialog
      return document.querySelector('div[aria-label="Message Body"]:not([aria-hidden="true"])');
    }
    if (this.currentProvider === 'outlook') {
      // Outlook reply boxes are often in the reading pane
      const candidates = Array.from(document.querySelectorAll('div[contenteditable="true"]'))
        .filter(el => {
          // Heuristic: reply boxes are visible, large, and not in a modal
          const rect = el.getBoundingClientRect();
          return el.offsetParent !== null && rect.width > 200 && rect.height > 50 &&
            el.closest('[data-app-section="ReadingPane"]');
        });
      // Return the largest one
      let largest = null, maxArea = 0;
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea) {
          maxArea = area;
          largest = el;
        }
      }
      return largest;
    }
    // Add Yahoo or other providers as needed
    return null;
  }

  htmlToPlainText(html) {
    // Simple HTML to plain text conversion
    return html
      .replace(/<\/p>/g, '\n\n')
      .replace(/<p>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/div>/g, '\n')
      .replace(/<div>/g, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/\n{3,}/g, '\n\n') // Clean up excessive line breaks
      .trim();
  }

  insertTemplate(element, template) {
    try {
      if (element && element.contentEditable === 'true') {
        element.innerHTML = template;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (element && (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT')) {
        element.value = this.htmlToPlainText(template);
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (element) element.focus();
    } catch (error) {
      console.error('Error inserting template:', error);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
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

    // Slide in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  closeTemplateModal() {
    if (this.activeTemplateModal && this.activeTemplateModal.parentNode) {
      this.activeTemplateModal.parentNode.removeChild(this.activeTemplateModal);
      this.activeTemplateModal = null;
    }
  }

  cleanup() {
    if (this.floatingActionButton && this.floatingActionButton.parentNode) {
      this.floatingActionButton.parentNode.removeChild(this.floatingActionButton);
    }
    this.closeTemplateModal();
    if (this.fabVisibilityTimer) {
      clearTimeout(this.fabVisibilityTimer);
    }
  }
}

// Initialize the email generator (no grammar checker)
function initEmailGenerator() {
  if (window.emailGrammarChecker) {
    window.emailGrammarChecker.cleanup();
    window.emailGrammarChecker = null;
  }

  try {
    window.emailGrammarChecker = new EmailGrammarChecker();
  
  } catch (error) {
    console.error('Failed to initialize Email Generator:', error);
  }
}

// Initialize based on document state
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailGenerator);
} else {
  initEmailGenerator();
}

// Additional initialization for dynamic email interfaces
setTimeout(initEmailGenerator, 2000);
setTimeout(initEmailGenerator, 5000);

// Handle extension updates
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onConnect?.addListener(() => {
    initEmailGenerator();
  });
}