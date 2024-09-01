document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  // Load saved API key
  chrome.storage.sync.get("apiKey", function (data) {
    if (data.apiKey) {
      apiKeyInput.value = data.apiKey;
    }
  });

  // Save API key
  saveBtn.addEventListener("click", function () {
    const apiKey = apiKeyInput.value.trim();
    chrome.storage.sync.set({ apiKey: apiKey }, function () {
      status.textContent = "API Key saved.";
      setTimeout(function () {
        status.textContent = "";
      }, 3000);
    });
  });
});
