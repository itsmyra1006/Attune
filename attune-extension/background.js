// Creates the right-click menu items on installation
chrome.runtime.onInstalled.addListener(() => {
  // Explain This menu item
  chrome.contextMenus.create({
    id: "explainText",
    title: "Attune: Explain This",
    contexts: ["selection"]
  });

  // Read Aloud menu item
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Attune: Read Aloud",
    contexts: ["selection"]
  });
});

// Listens for any click on a menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Logic for "Explain This"
  if (info.menuItemId === "explainText" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, { action: "showExplanationLoading", text: info.selectionText });

    fetch('http://127.0.0.1:3000/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: info.selectionText }),
    })
      .then(response => response.json())
      .then(data => {
        chrome.tabs.sendMessage(tab.id, {
          action: "showExplanationResult",
          explanation: data.explanation || `Error: ${data.error}`
        });
      })
      .catch(error => {
        console.error('Attune Explain feature error:', error);
        chrome.tabs.sendMessage(tab.id, {
          action: "showExplanationResult",
          explanation: "**Connection Error:** Could not reach the Attune local server. Make sure it is running."
        });
      });
  }

  // Logic for "Read Aloud"
  if (info.menuItemId === "readAloud" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, { action: "speak", text: info.selectionText });
  }
});