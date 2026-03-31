chrome.runtime.onInstalled.addListener(() => {
  console.log("Studia extension installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OAUTH_REQUEST") {
    sendResponse({ success: false, error: "not implemented" });
  }
});
