chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "selectionDetected") {
    console.log("💡 Forwarding selection:", msg.text);
    chrome.runtime.sendMessage({
      action: "selectedWord",
      text: msg.text
    });
  } else if (msg.action === "restore-last-closed-tab") {
    chrome.sessions.getRecentlyClosed({ maxResults: 1 }, (sessions) => {
      const last = sessions[0];
      if (last?.tab?.sessionId) {
        chrome.sessions.restore(last.tab.sessionId);
        chrome.runtime.sendMessage({
          action: "tabStatus",
          text: "Tab restored"
        });
      } else {
        console.log("No recently closed tab to restore.");
        chrome.runtime.sendMessage({
          action: "tabStatus",
          text: "No recently closed tab"
        });
      }
    });
  } else if (msg.action === "improveText") {
    chrome.tabs.sendMessage(sender.tab.id, {
      action: "showSuggestion",
      suggestion: "AI suggestion is awesome"
    });
  }
});
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Grammar Assistant installed");
  } else if (details.reason === "update") {
    console.log("Grammar Assistant updated");
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "grammar_check":
      break;
    case "settings":
      break;
    default:
      console.log("Unknown message type:", request.type);
  }
  return true;
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && !tab.url.startsWith("chrome://")) ;
});
