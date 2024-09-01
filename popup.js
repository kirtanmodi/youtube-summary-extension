// Constants for DOM elements
const ELEMENTS = {
  summarizeBtn: document.getElementById("summarizeBtn"),
  askBtn: document.getElementById("askBtn"),
  summaryDiv: document.getElementById("summary"),
  questionInput: document.getElementById("question"),
  answerDiv: document.getElementById("answer"),
  optionsBtn: document.getElementById("optionsBtn"),
  apiKeyStatus: document.getElementById("apiKeyStatus"),
};

// Enum for message types
const MessageType = {
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
};

// Main function to set up event listeners and initialize the popup
function initializePopup() {
  ELEMENTS.summarizeBtn.addEventListener("click", handleSummarize);
  ELEMENTS.askBtn.addEventListener("click", handleAskQuestion);
  ELEMENTS.optionsBtn.addEventListener("click", openOptionsPage);
  ELEMENTS.questionInput.addEventListener("keypress", handleEnterKeyPress);

  checkApiKeyStatus();
  loadStoredSummary();
}

// Function to display messages in the UI
function displayMessage(element, message, type = MessageType.INFO) {
  element.innerHTML = `<p class="${type}">${escapeHtml(message)}</p>`;
}

// Function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Simple markdown to HTML converter
function renderMarkdown(markdown) {
  // Convert headers
  markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Convert bold and italic
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>");
  markdown = markdown.replace(/\*(.*)\*/gim, "<em>$1</em>");

  // Convert links
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convert unordered lists
  markdown = markdown.replace(/^\s*\*\s(.+)/gim, "<ul><li>$1</li></ul>");
  markdown = markdown.replace(/<\/ul>\s*<ul>/g, "");

  // Convert ordered lists
  markdown = markdown.replace(/^\s*\d+\.\s(.+)/gim, "<ol><li>$1</li></ol>");
  markdown = markdown.replace(/<\/ol>\s*<ol>/g, "");

  // Convert code blocks
  markdown = markdown.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

  // Convert inline code
  markdown = markdown.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Convert paragraphs
  markdown = markdown.replace(/^\s*(\n)?(.+)/gim, function (m) {
    return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : "<p>" + m + "</p>";
  });

  // Remove empty paragraphs
  markdown = markdown.replace(/<p><\/p>/g, "");

  return markdown;
}

// Function to get the current active tab
async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  } catch (error) {
    console.error("Error getting current tab:", error);
    throw new Error("Failed to get current tab");
  }
}

// Function to check API key status
async function checkApiKeyStatus() {
  try {
    const { apiKey } = await chrome.storage.sync.get("apiKey");
    if (apiKey) {
      displayMessage(ELEMENTS.apiKeyStatus, "API Key is set", MessageType.SUCCESS);
      return true;
    } else {
      displayMessage(ELEMENTS.apiKeyStatus, "API Key is not set. Please set it in the options page.", MessageType.ERROR);
      return false;
    }
  } catch (error) {
    console.error("Error checking API key:", error);
    displayMessage(ELEMENTS.apiKeyStatus, "Error checking API key", MessageType.ERROR);
    return false;
  }
}

// Function to handle summarization
async function handleSummarize() {
  try {
    if (!(await checkApiKeyStatus())) {
      throw new Error("API Key is not set");
    }

    const tab = await getCurrentTab();
    if (!tab.url.includes("youtube.com/watch")) {
      throw new Error("Not a YouTube video page");
    }

    displayMessage(ELEMENTS.summaryDiv, "Fetching summary...");
    ELEMENTS.summarizeBtn.disabled = true;

    const response = await chrome.runtime.sendMessage({ action: "getSummary", url: tab.url });

    if (response && response.summary) {
      ELEMENTS.summaryDiv.innerHTML = renderMarkdown(response.summary);
      await storeSummary(response.summary);
    } else if (response && response.error) {
      throw new Error(response.error);
    } else {
      throw new Error("Failed to get summary");
    }
  } catch (error) {
    console.error("Error in getSummary:", error);
    displayMessage(ELEMENTS.summaryDiv, `Error: ${error.message}`, MessageType.ERROR);
  } finally {
    ELEMENTS.summarizeBtn.disabled = false;
  }
}

// Function to handle asking a question
async function handleAskQuestion() {
  try {
    if (!(await checkApiKeyStatus())) {
      throw new Error("API Key is not set");
    }

    const question = ELEMENTS.questionInput.value.trim();
    if (!question) {
      throw new Error("Please enter a question");
    }

    displayMessage(ELEMENTS.answerDiv, "Fetching answer...");
    ELEMENTS.askBtn.disabled = true;

    const response = await chrome.runtime.sendMessage({ action: "askQuestion", question: question });

    if (response && response.answer) {
      ELEMENTS.answerDiv.innerHTML = renderMarkdown(response.answer);
    } else if (response && response.error) {
      throw new Error(response.error);
    } else {
      throw new Error("Failed to get answer");
    }
  } catch (error) {
    console.error("Error in askQuestion:", error);
    displayMessage(ELEMENTS.answerDiv, `Error: ${error.message}`, MessageType.ERROR);
  } finally {
    ELEMENTS.askBtn.disabled = false;
  }
}

// Function to open the options page
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

// Function to handle Enter key press in the question input
function handleEnterKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleAskQuestion();
  }
}

// Function to store the summary in chrome.storage.local
async function storeSummary(summary) {
  try {
    await chrome.storage.local.set({ lastSummary: summary });
  } catch (error) {
    console.error("Error storing summary:", error);
  }
}

// Function to load the stored summary
async function loadStoredSummary() {
  try {
    const { lastSummary } = await chrome.storage.local.get("lastSummary");
    if (lastSummary) {
      ELEMENTS.summaryDiv.innerHTML = renderMarkdown(lastSummary);
    }
  } catch (error) {
    console.error("Error loading stored summary:", error);
  }
}

// Initialize the popup when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializePopup);
