document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    console.log("Mouseup detected. Selected text:", selectedText);
    chrome.runtime.sendMessage({
      action: "selectionDetected",
      text: selectedText
    });
  }
});
