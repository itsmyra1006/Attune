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
  const summaryBox = document.createElement('div');
  summaryBox.id = 'attune-summary-box';
  summaryBox.innerHTML = `<p style="font-weight: bold; font-size: 1.2em; margin-top: 0;">TL;DR Summary</p><p>${summaryText}</p>`;
  summaryBox.style.cssText = `padding: 20px; margin: 20px auto; border: 2px solid #0056b3; border-radius: 8px; background-color: #f0f8ff; max-width: 75ch; font-family: sans-serif; color: #111; z-index: 99999; position: relative;`;
  document.body.prepend(summaryBox);
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
  if(ruler) ruler.remove();
  document.removeEventListener('mousemove', followMouse);
  if (isActive) {
    const dyslexiaCSS = `@import url('https://fonts.googleapis.com/css2?family=Open+Dyslexic:wght@400;700&display=swap'); body * { font-family: 'Open Dyslexic', sans-serif !important; letter-spacing: 0.1em !important; word-spacing: 0.3em !important; } #attune-reading-ruler { position: fixed; background-color: #007bff; opacity: 0.3; height: 35px; width: 100vw; left: 0; z-index: 99999; pointer-events: none; box-shadow: 0 0 5px rgba(0,0,0,0.5); }`;
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
  const everythingSelector = `*`;

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
      displaySummary(data.summary || `Error: ${data.error}`);
    })
    .catch(error => {
      displaySummary("Error: Could not connect to the Attune server. Is it running?");
    });
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
