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
    fetch('http://127.0.0.1:3000/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: info.selectionText }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.explanation) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (explanation) => { alert(explanation); },
          args: [data.explanation]
        });
      }
    })
    .catch(error => console.error('Attune Explain feature error:', error));
  }

  // Logic for "Read Aloud"
  if (info.menuItemId === "readAloud" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, { action: "speak", text: info.selectionText });
  }
});