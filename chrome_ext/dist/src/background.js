const BASE_SERVER_URL = "https://alinea-ai.duckdns.org";
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "selectionDetected") {
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
        chrome.runtime.sendMessage({
          action: "tabStatus",
          text: "No recently closed tab"
        });
      }
    });
  } else if (msg.action === "tokens") {
    chrome.storage.local.set({ authTokens: msg.tokens });
  }
});
function getTokens() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["authTokens"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        if (!result.authTokens) {
          resolve(null);
        } else {
          resolve(JSON.parse(result.authTokens));
        }
      }
    });
  });
}
function setTokens(tokens) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ authTokens: JSON.stringify(tokens) }, resolve);
  });
}
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const tokens = await getTokens();
    if (tokens == null) {
      sendResponse({ success: false, error: "Please log in", role: "system" });
      return true;
    }
    switch (msg.action) {
      case "FETCH_USER":
        const result = await fetchUserData(tokens.accessToken, tokens.refreshToken);
        if (result.success == false) {
          sendResponse({ success: false, error: result.error });
          return;
        }
        sendResponse({ data: result.data.user });
        break;
      case "LOGOUT_BCK":
        logout();
        break;
      case "PARAPHRASE":
        const resultPara = await paraphrase(tokens.accessToken, tokens.refreshToken, msg.prompt);
        if (!resultPara.success) {
          sendResponse({ success: false, error: resultPara.error });
          return;
        }
        sendResponse({ success: true, data: resultPara.data });
        break;
      case "CHAT":
        const resultChat = await chat(tokens.accessToken, tokens.refreshToken, msg.prompt);
        if (!resultChat.success) {
          sendResponse({ success: false, error: resultChat.error });
          return;
        }
        sendResponse({ success: true, data: resultChat.data });
        break;
      case "PAST_MESSAGES":
        const messageResult = await pastMessages(tokens.accessToken, tokens.refreshToken);
        if (!messageResult.success) {
          sendResponse({ success: false, error: messageResult.error });
          return;
        }
        sendResponse({ success: true, data: messageResult.data });
        break;
      case "DOCUMENT_GENERATION":
        const resultDoc = await documentGenerator(tokens.accessToken, tokens.refreshToken, msg.prompt);
        if (!resultDoc.success) {
          sendResponse({ success: false, error: resultDoc.error });
          return;
        }
        sendResponse({ success: true, data: resultDoc.data });
        break;
      case "EMAIL_GENERATION":
        const resultEmail = await emailGeneration(tokens.accessToken, tokens.refreshToken, msg.prompt);
        if (!resultEmail.success) {
          sendResponse({ success: false, error: resultEmail.error });
          return;
        }
        sendResponse({ success: true, data: resultEmail.data });
        break;
    }
  })();
  return true;
});
async function pastMessages(accessToken, refreshToken) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/ai/past-messages`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "Token refresh failed" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/ai/past-messages`, {
          headers: { Authorization: `Bearer ${refreshed.accessToken}` }
        });
        const messages = await retryRes.json();
        return { success: true, data: messages.data };
      } catch (err) {
        console.error("Retry failed:", err);
        return { success: false, error: "Please login again" };
      }
    } else {
      const messages = await res.json();
      return { success: true, data: messages.data };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { sucess: false, error: "Failed to fetch Past messages" };
  }
}
async function documentGenerator(accessToken, refreshToken, userPrompt) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/ai/generate-doc-template`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userPrompt })
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "Token refresh failed" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/ai/generate-doc-template`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshed.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: userPrompt })
        });
        const aiResponse = await retryRes.json();
        if (retryRes.status != 200) {
          return { success: false, error: aiResponse.message };
        }
        return { success: true, data: aiResponse.message };
      } catch (err) {
        console.error("Retry failed:", err.message);
        return { success: false, error: "Please login again" };
      }
    } else if (res.status == 413) {
      return { success: false, error: "Token Exceeded, Please upgrade plan" };
    } else {
      const aiResponse = await res.json();
      return { success: true, data: aiResponse.message };
    }
  } catch (err) {
    return { success: false, error: "Unknown error" };
  }
}
async function emailGeneration(accessToken, refreshToken, userPrompt) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/ai/generate-template`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userPrompt })
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "Token refresh failed" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/ai/generate-template`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshed.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: userPrompt })
        });
        const aiResponse = await retryRes.json();
        if (retryRes.status != 200) {
          return { success: false, error: aiResponse.message };
        }
        return { success: true, data: aiResponse.message };
      } catch (err) {
        console.error("Retry failed:", err.message);
        return { success: false, error: "Please login again" };
      }
    } else if (res.status == 413) {
      return { success: false, error: "Token Exceeded, Please upgrade plan" };
    } else {
      const aiResponse = await res.json();
      return { success: true, data: aiResponse.message };
    }
  } catch (err) {
    return { success: false, error: "Unknown error" };
  }
}
async function chat(accessToken, refreshToken, userPrompt) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userPrompt })
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "There is trouble authenticating", role: "system" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/ai/chat`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshed.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: userPrompt })
        });
        const aiResponse = await retryRes.json();
        if (retryRes.status != 200) {
          return { success: false, error: aiResponse.message, role: "system" };
        }
        return { success: true, data: aiResponse.response };
      } catch (err) {
        console.error("Retry failed:", err.message);
        return { success: false, error: "Please login again", role: "system" };
      }
    } else if (res.status == 413) {
      return { success: false, error: "Token Exceeded, Please upgrade plan", role: "system" };
    } else if (res.status == 200) {
      const aiResponse = await res.json();
      return { success: true, data: aiResponse.response };
    } else {
      return { success: false, error: "There is an issue with our Servers", role: "system" };
    }
  } catch (err) {
    return { success: false, error: "Unknown error", role: "system" };
  }
}
async function paraphrase(accessToken, refreshToken, userPrompt) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/ai/paraphrase`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: userPrompt })
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "Token refresh failed" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/ai/paraphrase`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${refreshed.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: userPrompt })
        });
        const paraphrased = await retryRes.json();
        if (retryRes.status != 200) {
          return { success: false, error: paraphrased.message };
        }
        return { success: true, data: paraphrased.message };
      } catch (err) {
        console.error("Retry failed:", err.message);
        return { success: false, error: "Please login again" };
      }
    } else if (res.status == 413) {
      return { success: false, error: "Token Exceeded, Please upgrade plan" };
    } else {
      const paraphrased = await res.json();
      return { success: true, data: paraphrased.message };
    }
  } catch (err) {
    return { success: false, error: "Unknown error" };
  }
}
function logout() {
  chrome.storage.local.clear(() => {
    chrome.runtime.sendMessage({ action: "EXT_LOGOUT" });
  });
}
async function fetchUserData(accessToken, refreshToken) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (res.status === 401) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (!refreshed) {
        return { success: false, error: "Token refresh failed" };
      }
      const updatedTokens = { accessToken: refreshed.accessToken, refreshToken };
      await setTokens(updatedTokens);
      try {
        const retryRes = await fetch(`${BASE_SERVER_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${refreshed.accessToken}` }
        });
        const userData = await retryRes.json();
        return { success: true, data: userData };
      } catch (err) {
        console.error("Retry failed:", err);
        return { success: false, error: "Please login again" };
      }
    } else {
      const userData = await res.json();
      return { success: true, data: userData };
    }
  } catch (err) {
    console.error("Fetch error:", err);
    return { sucess: false, error: "Failed to fetch user data" };
  }
}
async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${BASE_SERVER_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });
    if (!res.ok) throw new Error("Refresh failed");
    return await res.json();
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return null;
  }
}
function urlMatches(url, patterns) {
  for (const pattern of patterns) {
    if (pattern.endsWith("/*") && url.startsWith(pattern.slice(0, -2))) {
      return true;
    }
    if (url.startsWith(pattern)) {
      return true;
    }
  }
  return false;
}
const GLOBAL_SCRIPTS = ["src/content.js"];
const TOKEN_LISTENER_SCRIPT = "src/tokenListener.js";
const TOKEN_LISTENER_PATTERNS = [
  "http://localhost:5173/",
  "https://alinea-ai.netlify.app/"
];
chrome.runtime.onInstalled.addListener(async () => {
  chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, async (tabs) => {
    for (const tab of tabs) {
      if (tab.url.startsWith("chrome")) continue;
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: GLOBAL_SCRIPTS
      });
      if (urlMatches(tab.url, TOKEN_LISTENER_PATTERNS)) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [TOKEN_LISTENER_SCRIPT]
        });
      }
    }
  });
});
