let apiKey;

async function initializeApiKey() {
  try {
    const { apiKey: storedApiKey } = await chrome.storage.sync.get("apiKey");
    apiKey = storedApiKey;
  } catch (error) {
    console.error("Error initializing API key:", error);
  }
}

initializeApiKey();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.apiKey) {
    apiKey = changes.apiKey.newValue;
  }
});

async function getTranscript(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    // Use a more flexible regex to find the captions data
    const transcriptDataMatch = html.match(/"captions":\s*({.+?})\s*,\s*"videoDetails"/);

    if (!transcriptDataMatch) {
      throw new Error("No transcript data found in the YouTube page");
    }

    let captionTracks;
    try {
      // Use a custom JSON parser to handle potential issues
      const parsedData = parseJSON(transcriptDataMatch[1]);
      captionTracks = parsedData.playerCaptionsTracklistRenderer.captionTracks;
    } catch (parseError) {
      console.error("Raw caption data:", transcriptDataMatch[1]);
      throw new Error(`Failed to parse transcript data: ${parseError.message}`);
    }

    if (!captionTracks || captionTracks.length === 0) {
      throw new Error("No caption tracks found");
    }

    const transcriptUrl = captionTracks[0].baseUrl;
    const transcriptResponse = await fetch(transcriptUrl);
    const transcriptText = await transcriptResponse.text();
    return transcriptText.replace(/<[^>]*>/g, "");
  } catch (error) {
    console.error("Full error in getTranscript:", error);
    throw new Error(`Failed to get transcript: ${error.message}`);
  }
}

// Custom JSON parser to handle potential issues
function parseJSON(str) {
  return JSON.parse(
    str.replace(/\\x([0-9A-Fa-f]{2})/g, function () {
      return String.fromCharCode(parseInt(arguments[1], 16));
    })
  );
}

async function callBackendAPI(endpoint, data) {
  try {
    const response = await fetch(`http://localhost:3000/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Backend API error: ${error.message}`);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSummary") {
    (async () => {
      try {
        const videoId = new URL(request.url).searchParams.get("v");
        if (!videoId) {
          throw new Error("Invalid YouTube URL");
        }

        const transcript = await getTranscript(videoId);
        const { summary } = await callBackendAPI("summarize", { transcript });
        await chrome.storage.local.set({ lastSummary: summary });
        sendResponse({ summary });
      } catch (error) {
        console.error("Error in getSummary:", error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  } else if (request.action === "askQuestion") {
    (async () => {
      try {
        const { lastSummary } = await chrome.storage.local.get("lastSummary");
        if (!lastSummary) {
          throw new Error("No summary available. Please summarize the video first.");
        }
        const { answer } = await callBackendAPI("ask", { question: request.question, summary: lastSummary });
        sendResponse({ answer });
      } catch (error) {
        console.error("Error in askQuestion:", error);
        sendResponse({ error: error.message });
      }
    })();
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
    chrome.tabs.sendMessage(tabId, { action: "newVideoLoaded", url: tab.url });
  }
});
