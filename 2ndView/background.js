chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "embedplay-open",
    title: "Open in 2ndView",
    contexts: ["link"],
    targetUrlPatterns: [
      "*://*.youtube.com/watch*",
      "*://youtu.be/*",
    ],
    documentUrlPatterns: ["*://*.youtube.com/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "embedplay-open" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_EMBED_URL",
      url: info.linkUrl,
    });
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "open-embed" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "OPEN_EMBED" });
  }
});

