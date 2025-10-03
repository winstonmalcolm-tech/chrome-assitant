//Listen for messages from the webpage

window.addEventListener("message", (event) => {
  if (event.data?.type === "AUTH_TOKEN") {
    const tokens = event.data.tokens;
    chrome.runtime.sendMessage({ action: "tokens", tokens });
  } else if (event.data?.type === "LOGOUT") {
    chrome.runtime.sendMessage({ action: "LOGOUT_BCK"});

  } else if (event.data?.type === 'CHECK_EXTENSION') {

    window.postMessage({ from: 'alinea.ai_1289', status: 'installed' }, '*');
  }
});

// Notify the page that the content script is ready
window.postMessage({ type: "CONTENT_SCRIPT_READY" }, "*");