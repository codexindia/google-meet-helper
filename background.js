chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes("meet.google.com")) {
    chrome.action.setPopup({ tabId: tabId, popup: "popup.html" });
  } else {
    chrome.action.setPopup({ tabId: tabId, popup: "" });
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes("meet.google.com")) {
      chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
    } else {
      chrome.action.setPopup({ tabId: tab.id, popup: "" });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleLogging') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          files: ['content.js']
        },
        () => {
          chrome.tabs.sendMessage(tabs[0].id, { logging: request.logging });
        }
      );
    });
  }
});