document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");
  const storageContent = document.getElementById("storageContent");
  const deleteStorageBtn = document.getElementById("deleteStorageBtn");

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
      showStatus("API Key saved.", "success");
      displayStorageContent();
    });
  });

  // Display storage content
  function displayStorageContent() {
    Promise.all([
      new Promise((resolve) => chrome.storage.sync.get(null, (data) => resolve({ sync: data }))),
      new Promise((resolve) => chrome.storage.local.get(null, (data) => resolve({ local: data }))),
    ])
      .then((results) => {
        const allStorage = Object.assign({}, ...results);
        storageContent.innerHTML = "<h3>Current Storage:</h3>";
        storageContent.innerHTML += "<h4>Sync Storage:</h4>";
        storageContent.innerHTML += formatStorageData(allStorage.sync);
        storageContent.innerHTML += "<h4>Local Storage:</h4>";
        storageContent.innerHTML += formatStorageData(allStorage.local);
      })
      .catch((error) => {
        console.error("Error fetching storage data:", error);
        showStatus("Error fetching storage data. Please check the console for details.", "error");
      });
  }

  // Format storage data for display
  function formatStorageData(data) {
    if (Object.keys(data).length === 0) {
      return "<p>No data stored.</p>";
    }
    let html = "<ul>";
    for (const [key, value] of Object.entries(data)) {
      html += `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`;
    }
    html += "</ul>";
    return html;
  }

  // Delete all storage
  deleteStorageBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete all stored data? This action cannot be undone.")) {
      Promise.all([new Promise((resolve) => chrome.storage.sync.clear(resolve)), new Promise((resolve) => chrome.storage.local.clear(resolve))])
        .then(() => {
          showStatus("All storage has been cleared.", "success");
          apiKeyInput.value = ""; // Clear the API key input
          displayStorageContent();
        })
        .catch((error) => {
          console.error("Error clearing storage:", error);
          showStatus("Error clearing storage. Please check the console for details.", "error");
        });
    }
  });

  // Show status message
  function showStatus(message, type) {
    status.textContent = message;
    status.className = type;
    setTimeout(function () {
      status.textContent = "";
      status.className = "";
    }, 3000);
  }

  // Initial display of storage content
  displayStorageContent();
});
