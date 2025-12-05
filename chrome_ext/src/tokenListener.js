// //Listen for messages from the webpage

// window.addEventListener("message", (event) => {
//   if (event.data?.type === "AUTH_TOKEN") {
//     const tokens = event.data.tokens;
//     chrome.runtime.sendMessage({ action: "tokens", tokens });
//   } else if (event.data?.type === "LOGOUT") {
//     chrome.runtime.sendMessage({ action: "LOGOUT_BCK"});

//   } else if (event.data?.type === 'CHECK_EXTENSION') {

//     window.postMessage({ from: 'alinea.ai_1289', status: 'installed' }, '*');
//   }
// });

// // Notify the page that the content script is ready
// window.postMessage({ type: "CONTENT_SCRIPT_READY" }, "*");

// content.js

let acknowledged = false;
let attempts = 0;
const maxAttempts = 20;

// Repeatedly notify the page that the content script is ready
const pingPage = () => {
  if (acknowledged || attempts >= maxAttempts) return;

  window.postMessage({ type: "CONTENT_SCRIPT_READY" }, "*");
  attempts++;
  setTimeout(pingPage, 500); // retry every 500ms
};

pingPage();

// Listen for messages from the webpage
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "AUTH_TOKEN") {
    acknowledged = true;
    chrome.runtime.sendMessage({ action: "tokens", tokens: event.data.tokens });
  }

  if (event.data?.type === "CHECK_EXTENSION") {
    window.postMessage({ type: "CONTENT_SCRIPT_READY", from: "alinea.ai_1289", status: "installed" }, "*");
  }

  if (event.data?.type === "LOGOUT") {
    chrome.runtime.sendMessage({ action: "LOGOUT_BCK" });
  }
});