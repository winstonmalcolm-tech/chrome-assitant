document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    // Optional: Send selected text to your side panel or background script
    chrome.runtime.sendMessage({
      action: "selectionDetected",
      text: selectedText
    });
  }
});