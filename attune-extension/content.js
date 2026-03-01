// Global state trackers
let adhdStylesActive = false;
let dyslexiaStylesActive = false;

// --- All Helper Functions ---
function addStylesheet(id, css) {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.id = id;
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);
}

function removeStylesheet(id) {
  const styleElement = document.getElementById(id);
  if (styleElement) {
    styleElement.remove();
  }
}

function followMouse(e) {
  const ruler = document.getElementById('attune-reading-ruler');
  if (ruler) {
    ruler.style.top = (e.clientY - (ruler.offsetHeight / 2)) + 'px';
  }
}

function displaySummary(summaryText) {
  const oldSummaryBox = document.getElementById('attune-summary-box');
  if (oldSummaryBox) oldSummaryBox.remove();

  if (!document.getElementById('attune-dyslexic-font')) {
    const fontStyle = document.createElement('style');
    fontStyle.id = 'attune-dyslexic-font';
    fontStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=Open+Dyslexic:wght@400;700&display=swap');`;
    document.head.appendChild(fontStyle);
  }

  const summaryBox = document.createElement('div');
  summaryBox.id = 'attune-summary-box';
  summaryBox.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 12px; margin-bottom: 20px;">
      <p style="font-weight: bold; font-size: 1.3em; margin: 0; color: #1a73e8; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2em;">📖</span>
        TL;DR Summary
      </p>
      <button id="attune-tldr-close" style="background: none; border: none; cursor: pointer; color: #5f6368; padding: 6px; border-radius: 50%; font-size: 16px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>
    <div style="line-height: 1.8; letter-spacing: 0.3px;">${summaryText.replace(/<strong/g, '<strong style="display: block; margin-top: 24px; margin-bottom: 8px; font-size: 1.1em; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px;"')}</div>
  `;
  summaryBox.style.cssText = `
    padding: 24px 32px; 
    margin: 20px auto; 
    border: 1px solid #dadce0; 
    border-radius: 12px; 
    background-color: #ffffff; 
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    max-width: 800px; 
    font-family: 'Open Dyslexic', -apple-system, sans-serif !important; 
    color: #202124; 
    z-index: 99999; 
    position: relative; 
    font-size: 15px;
  `;
  document.body.prepend(summaryBox);

  // smoothly pan to top 
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const closeBtn = document.getElementById('attune-tldr-close');
  if (closeBtn) closeBtn.addEventListener('click', () => summaryBox.remove());
}

// --- AI Explanation UI ---
function displayExplanationPopup(content, isLoading) {
  let popup = document.getElementById('attune-explain-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'attune-explain-popup';
    document.body.appendChild(popup);

    // Close on click outside or escape
    const closePopup = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'mousedown' && popup.contains(e.target)) return;
      popup.remove();
      document.removeEventListener('mousedown', closePopup);
      document.removeEventListener('keydown', closePopup);
    };

    setTimeout(() => {
      document.addEventListener('mousedown', closePopup);
      document.addEventListener('keydown', closePopup);
    }, 100);

    const selection = window.getSelection();
    let rect = { bottom: window.innerHeight / 2, left: window.innerWidth / 2 };
    if (selection && selection.rangeCount > 0) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
    }

    popup.style.cssText = `
      position: absolute;
      top: ${rect.bottom + window.scrollY + 10}px;
      left: ${Math.max(10, rect.left + window.scrollX)}px;
      width: 380px;
      max-width: 90vw;
      background: #ffffff !important;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.2) !important;
      border-radius: 12px !important;
      padding: 16px !important;
      z-index: 2147483647 !important;
      color: #202124 !important;
      font-family: 'Open Dyslexic', -apple-system, sans-serif !important;
      border: 1px solid #dadce0 !important;
      line-height: 1.5 !important;
      font-size: 14px !important;
      text-align: left !important;
    `;
  }

  // Parse Markdown formatting for lists, bold text, and paragraphs
  let formattedContent = content;
  // Bold
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1a73e8;">$1</strong>');

  // Lists
  const listItems = [];
  const lines = formattedContent.split('\n');
  let inList = false;
  let htmlResult = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^[-*]\s+/)) {
      if (!inList) { htmlResult += '<ul style="margin: 8px 0; padding-left: 20px;">\n'; inList = true; }
      htmlResult += `  <li style="margin-bottom: 4px;">${line.replace(/^[-*]\s+/, '')}</li>\n`;
    } else {
      if (inList) { htmlResult += '</ul>\n'; inList = false; }
      if (line !== '') htmlResult += `<p style="margin-top: 0; margin-bottom: 12px;">${line}</p>\n`;
    }
  }
  if (inList) htmlResult += '</ul>\n';
  formattedContent = htmlResult;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; margin-bottom: 14px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.3em;">📝</span>
        <strong style="font-size: 15px; color: #1a73e8; margin: 0; padding: 0; font-weight: 500;">Attune AI Assistant</strong>
      </div>
      <button id="attune-explain-close" style="background: none; border: none; cursor: pointer; color: #5f6368; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; margin: 0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f3f4'" onmouseout="this.style.backgroundColor='transparent'">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
    </div>
    <div style="max-height: 400px; overflow-y: auto; padding-right: 8px; margin: 0; line-height: 1.6; font-size: 14.5px; color: #202124;">
      ${isLoading ?
      '<div style="display: flex; align-items: center; gap: 10px; color: #5f6368; padding: 10px 0;"><div class="attune-spinner" style="width: 18px; height: 18px; border: 2px solid #f3f3f3; border-top: 2px solid #1a73e8; border-radius: 50%; animation: attune-spin 1s linear infinite;"></div>Thinking...</div>'
      : formattedContent}
    </div>
  `;

  if (isLoading && !document.getElementById('attune-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'attune-spinner-style';
    style.textContent = `
      @keyframes attune-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      #attune-explain-popup div::-webkit-scrollbar { width: 6px; }
      #attune-explain-popup div::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 3px; }
      #attune-explain-popup div::-webkit-scrollbar-track { background: transparent; }
    `;
    document.head.appendChild(style);
  }

  // Prevent popup from running off-screen width-wise
  const popupRect = popup.getBoundingClientRect();
  if (popupRect.right > window.innerWidth) {
    popup.style.left = `${Math.max(10 + window.scrollX, window.innerWidth - popupRect.width - 20 + window.scrollX)}px`;
  }

  const closeBtn = document.getElementById('attune-explain-close');
  if (closeBtn) closeBtn.addEventListener('click', () => popup.remove());
}

// --- All Mode-Applying Functions ---
function applyADHDMode(isActive) {
  removeStylesheet('attune-adhd-styles');
  if (isActive) {
    const adhdCSS = `body, div, header, nav, section, article, aside, main, footer { display: block !important; float: none !important; position: static !important; width: auto !important; margin: 2em auto !important; padding: 0 !important; max-width: 75ch !important; background-color: #FFFFFF !important; border: none !important; box-shadow: none !important; } body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; font-size: 1.1em !important; line-height: 1.7 !important; color: #111111 !important; background-color: #FFFFFF !important; } iframe, .ad, #comments, .sidebar, .social-share, .related-posts, footer, header, nav { display: none !important; } a { color: #0056b3 !important; text-decoration: underline !important; } img { max-width: 100% !important; height: auto !important; display: block !important; margin-top: 1em !important; margin-bottom: 1em !important; border-radius: 8px !important; }`;
    addStylesheet('attune-adhd-styles', adhdCSS);
  }
  adhdStylesActive = isActive;
}

function applyDyslexiaMode(isActive) {
  removeStylesheet('attune-dyslexia-styles');
  const ruler = document.getElementById('attune-reading-ruler');
  if (ruler) ruler.remove();
  document.removeEventListener('mousemove', followMouse);
  if (isActive) {
    const dyslexiaCSS = `@import url('https://fonts.googleapis.com/css2?family=Open+Dyslexic:wght@400;700&display=swap'); body * { font-family: 'Open Dyslexic', sans-serif !important; letter-spacing: 0.1em !important; word-spacing: 0.3em !important; } #attune-reading-ruler { position: fixed !important; background-color: #007bff !important; opacity: 0.3 !important; height: 35px !important; width: 100vw !important; left: 0 !important; z-index: 99999 !important; pointer-events: none !important; box-shadow: 0 0 5px rgba(0,0,0,0.5) !important; border: none !important; }`;
    addStylesheet('attune-dyslexia-styles', dyslexiaCSS);
    const newRuler = document.createElement('div');
    newRuler.id = 'attune-reading-ruler';
    document.body.appendChild(newRuler);
    document.addEventListener('mousemove', followMouse);
  }
  dyslexiaStylesActive = isActive;
}

function applyTheme(themeName) {
  removeStylesheet('attune-theme-styles');
  if (!themeName || themeName === 'none') return;

  let themeCSS = '';
  const everythingSelector = `*:not(#attune-reading-ruler)`;

  switch (themeName) {
    case 'light-contrast':
      themeCSS = `
        ${everythingSelector} { background-color: #FFFFFF !important; color: #000000 !important; } 
        a { color: #0000FF !important; text-decoration: underline !important; font-weight: bold !important; } 
        img, video, svg, iframe, canvas { background-color: initial !important; }`;
      break;
    case 'dark':
      themeCSS = `
        html { background-color: #121212 !important; }
        ${everythingSelector} { background-color: #121212 !important; color: #e0e0e0 !important; border-color: #555 !important; } 
        a { color: #58a6ff !important; } 
        img, video, svg, iframe, canvas { background-color: initial !important; border-color: initial !important; }`;
      break;
    case 'inverted':
      themeCSS = `
        html { filter: invert(1) !important; background-color: #fff !important; } 
        img, video, iframe, svg, canvas { filter: invert(1) !important; }`;
      break;
    case 'low-blue':
      themeCSS = `
        body::before { content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #FFC107; opacity: 0.15; z-index: 99998; pointer-events: none; }`;
      break;
    case 'pastel':
      themeCSS = `
        ${everythingSelector} { background-color: #f0f8ff !important; color: #5a5a5a !important; } 
        a { color: #5f9ea0 !important; } 
        img, video, svg, iframe, canvas { background-color: initial !important; }`;
      break;
  }
  if (themeCSS) addStylesheet('attune-theme-styles', themeCSS);
}

// --- Main Logic ---
// Listen for commands from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleADHD") applyADHDMode(!adhdStylesActive);
  if (request.action === "toggleDyslexia") applyDyslexiaMode(!dyslexiaStylesActive);
  if (request.action === "applyTheme") applyTheme(request.theme);
  if (request.action === "generateTLDR") {
    const mainContent = document.body.innerText;
    displaySummary("Summarizing... please wait.");
    fetch('http://127.0.0.1:3000/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: mainContent }),
    })
      .then(response => response.json())
      .then(data => {
        // Run markdown parser on the tldr text before displaying
        let tldrText = data.summary || `Error: ${data.error} `;
        tldrText = tldrText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1a73e8;">$1</strong>');
        const lines = tldrText.split('\n');
        let inList = false;
        let htmlResult = '';
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.match(/^[-*]\s+/)) {
            if (!inList) { htmlResult += '<ul style="margin: 8px 0; padding-left: 20px;">\n'; inList = true; }
            htmlResult += `  <li style="margin-bottom: 4px;">${line.replace(/^[-*]\s+/, '')}</li>\n`;
          } else {
            if (inList) { htmlResult += '</ul>\n'; inList = false; }
            if (line !== '') htmlResult += `<p style="margin-top: 0; margin-bottom: 12px;">${line}</p>\n`;
          }
        }
        if (inList) htmlResult += '</ul>\n';

        displaySummary(htmlResult);
      })
      .catch(error => {
        displaySummary("Error: Could not connect to the Attune server. Is it running?");
      });
  }

  // --- AI Explanation Handling ---
  if (request.action === "showExplanationLoading") {
    displayExplanationPopup(request.text, true);
  }
  if (request.action === "showExplanationResult") {
    displayExplanationPopup(request.explanation, false);
  }

  // --- TTS Handling ---
  const updateSpeechState = () => {
    chrome.storage.local.set({
      speechState: {
        isSpeaking: window.speechSynthesis.speaking || window.speechSynthesis.pending,
        isPaused: window.speechSynthesis.paused
      }
    });
    chrome.runtime.sendMessage({ action: 'speechStateUpdate' });
  };

  if (request.action === "speak" && request.text) {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(request.text);

    utterance.onstart = updateSpeechState;
    utterance.onend = updateSpeechState;
    utterance.onerror = updateSpeechState;
    utterance.onpause = updateSpeechState;
    utterance.onresume = updateSpeechState;

    window.speechSynthesis.speak(utterance);
    updateSpeechState();
  }

  if (request.action === "pauseResume") {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
      updateSpeechState();
    }
  }

  if (request.action === "stop") {
    window.speechSynthesis.cancel();
    updateSpeechState();
  }
});

// On page load, automatically apply saved settings
chrome.storage.local.get('attuneState', (data) => {
  if (data.attuneState) {
    applyADHDMode(data.attuneState.adhdActive);
    applyDyslexiaMode(data.attuneState.dyslexiaActive);
    applyTheme(data.attuneState.selectedTheme);
  }
});
