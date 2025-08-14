// background.js
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "selectionDetected") {
    console.log("💡 Forwarding selection:", msg.text);

    // Forward to the side panel
    chrome.runtime.sendMessage({
      action: "selectedWord",
      text: msg.text
    });
  }
  else if (msg.action === "restore-last-closed-tab") {
    chrome.sessions.getRecentlyClosed({ maxResults: 1 }, (sessions) => {
      const last = sessions[0];
      if (last?.tab?.sessionId) {
        chrome.sessions.restore(last.tab.sessionId);

        // Forward to the side panel
        chrome.runtime.sendMessage({
          action: "tabStatus",
          text: "Tab restored"
        });

      } else {
        console.log("No recently closed tab to restore.");

        // Forward to the side panel
        chrome.runtime.sendMessage({
          action: "tabStatus",
          text: "No recently closed tab"
        });
      }
    });
  }
  else if (msg.action === "improveText") {
    // Call your AI endpoint or Supabase function
    // fetch("https://your-ai-endpoint.com/improve", {
    //   method: "POST",
    //   body: JSON.stringify({ text: msg.text }),
    //   headers: { "Content-Type": "application/json" }
    // })
    // .then(res => res.json())
    // .then(data => {
    //   chrome.tabs.sendMessage(sender.tab.id, {
    //     action: "showSuggestion",
    //     suggestion: data.improvedText
    //   });
    // });

    chrome.tabs.sendMessage(sender.tab.id, {
        action: "showSuggestion",
        suggestion: "AI suggestion is awesome"
    });
  }

});

// Grammar Assistant Background Script

// This is a minimal background script for the extension
// It handles extension lifecycle and could be extended for additional features

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Grammar Assistant installed');
  } else if (details.reason === 'update') {
    console.log('Grammar Assistant updated');
  }
});

// Handle any messages from content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different message types
  switch (request.type) {
    case 'grammar_check':
      // Could implement server-side grammar checking here
      // For now, grammar checking is done in content script
      break;
    
    case 'settings':
      // Could handle user settings/preferences
      break;
    
    default:
      console.log('Unknown message type:', request.type);
  }
  
  // Always return true for async responses
  return true;
});

// Optional: Handle tab updates to reinitialize on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    // Extension will automatically reinitialize via content script
  }
});
