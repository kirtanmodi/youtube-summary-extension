document.addEventListener("DOMContentLoaded", function () {
  const summarizeBtn = document.getElementById("summarizeBtn");
  const askBtn = document.getElementById("askBtn");
  const summaryDiv = document.getElementById("summary");
  const questionInput = document.getElementById("question");
  const answerDiv = document.getElementById("answer");
  const optionsBtn = document.getElementById("optionsBtn");
  const apiKeyStatus = document.getElementById("apiKeyStatus");

  function displayError(element, message) {
    element.innerHTML = `<p class="error" style="color: red;">${message}</p>`;
  }

  function displayInfo(element, message) {
    element.innerHTML = `<p class="info">${message}</p>`;
  }

  function getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs[0]);
      });
    });
  }

  async function checkApiKey() {
    try {
      const { apiKey } = await chrome.storage.sync.get("apiKey");
      if (apiKey) {
        apiKeyStatus.textContent = "API Key is set";
        return true;
      } else {
        apiKeyStatus.textContent = "API Key is not set. Please set it in the options page.";
        return false;
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      apiKeyStatus.textContent = "Error checking API key";
      return false;
    }
  }

  async function getSummary() {
    try {
      if (!(await checkApiKey())) {
        throw new Error("API Key is not set");
      }

      const tab = await getCurrentTab();
      if (!tab.url.includes("youtube.com/watch")) {
        throw new Error("Not a YouTube video page");
      }

      displayInfo(summaryDiv, "Fetching summary...");
      const response = await chrome.runtime.sendMessage({ action: "getSummary", url: tab.url });

      if (response && response.summary) {
        summaryDiv.textContent = response.summary;
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        throw new Error("Failed to get summary");
      }
    } catch (error) {
      console.error("Error in getSummary:", error);
      displayError(summaryDiv, `Error: ${error.message}`);
    }
  }

  async function askQuestion() {
    try {
      if (!(await checkApiKey())) {
        throw new Error("API Key is not set");
      }

      const question = questionInput.value.trim();
      if (!question) {
        throw new Error("Please enter a question");
      }

      displayInfo(answerDiv, "Fetching answer...");
      const response = await chrome.runtime.sendMessage({ action: "askQuestion", question: question });

      if (response && response.answer) {
        answerDiv.textContent = response.answer;
      } else if (response && response.error) {
        throw new Error(response.error);
      } else {
        throw new Error("Failed to get answer");
      }
    } catch (error) {
      console.error("Error in askQuestion:", error);
      displayError(answerDiv, `Error: ${error.message}`);
    }
  }

  summarizeBtn.addEventListener("click", getSummary);
  askBtn.addEventListener("click", askQuestion);
  optionsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Check API key status when popup opens
  checkApiKey();
});
