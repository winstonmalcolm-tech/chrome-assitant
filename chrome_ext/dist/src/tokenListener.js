let acknowledged = false;
let attempts = 0;
const maxAttempts = 20;
const pingPage = () => {
  if (acknowledged || attempts >= maxAttempts) return;
  window.postMessage({ type: "CONTENT_SCRIPT_READY" }, "*");
  attempts++;
  setTimeout(pingPage, 500);
};
pingPage();
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "AUTH_TOKEN") {
    acknowledged = true;
    chrome.runtime.sendMessage({ action: "tokens", tokens: event.data.tokens });
  }
  if (event.data?.type === "CHECK_EXTENSION") {
    window.postMessage({ type: "CONTENT_SCRIPT_READY" }, "*");
  }
  if (event.data?.type === "LOGOUT") {
    chrome.runtime.sendMessage({ action: "LOGOUT_BCK" });
  }
});
