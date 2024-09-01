chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "newVideoLoaded") {
    console.log("New YouTube video loaded:", request.url);
    // You can add any additional logic here if needed when a new video is loaded
  }
});
