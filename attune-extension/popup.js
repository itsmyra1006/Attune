const adhdButton = document.getElementById('adhdMode');
const dyslexiaButton = document.getElementById('dyslexiaMode');
const themeSelect = document.getElementById('theme-select');
const ttsContainer = document.getElementById('tts-container');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const stopBtn = document.getElementById('stopBtn');

function saveState() {
  const state = {
    adhdActive: adhdButton.classList.contains('active'),
    dyslexiaActive: dyslexiaButton.classList.contains('active'),
    selectedTheme: themeSelect.value
  };
  chrome.storage.local.set({ attuneState: state });
}

function loadState() {
  chrome.storage.local.get(['attuneState', 'speechState'], (data) => {
    // Load main state
    if (data.attuneState) {
      const { adhdActive, dyslexiaActive, selectedTheme } = data.attuneState;
      themeSelect.value = selectedTheme || 'none';
      if (adhdActive) adhdButton.classList.add('active'); else adhdButton.classList.remove('active');
      if (dyslexiaActive) dyslexiaButton.classList.add('active'); else dyslexiaButton.classList.remove('active');
    }
    // Load speech state and show/hide controls
    if (data.speechState && data.speechState.isSpeaking) {
      ttsContainer.style.display = 'block';
      pauseResumeBtn.textContent = data.speechState.isPaused ? 'Resume' : 'Pause';
    } else {
      ttsContainer.style.display = 'none';
    }
  });
}

adhdButton.addEventListener('click', () => {
  adhdButton.classList.toggle('active');
  saveState();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleADHD" });
  });
});

dyslexiaButton.addEventListener('click', () => {
  dyslexiaButton.classList.toggle('active');
  saveState();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "toggleDyslexia" });
  });
});

themeSelect.addEventListener('change', () => {
  saveState();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyTheme", theme: themeSelect.value });
  });
});

document.getElementById('tldr').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "generateTLDR" });
  });
});

// TTS Button Listeners
pauseResumeBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "pauseResume" });
  });
});

stopBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "stop" });
  });
});

// Listen for state changes from the content script
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'speechStateUpdate') {
        loadState();
    }
});


document.addEventListener('DOMContentLoaded', loadState);