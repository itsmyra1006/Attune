// Global state trackers
let adhdStylesActive = false;
let dyslexiaStylesActive = false;
let currentUtterance = null;

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
  if (styleElement) styleElement.remove();
}
function followMouse(e) {
  const ruler = document.getElementById('attune-reading-ruler');
  if (ruler) ruler.style.top = (e.clientY - (ruler.offsetHeight / 2)) + 'px';
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