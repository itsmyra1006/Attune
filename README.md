# Attune 

A browser extension that dynamically adapts the web to your mind.
A screenshot of Attune's TL;DR Summary feature in action on Wikipedia.

The digital world is largely built for a neurotypical framework, creating invisible barriers for the 15-20% of the population that is neurodivergent. Attune is a browser extension designed to bridge this gap. It acts as a real-time accessibility layer, using AI and dynamic styling to transform cluttered, overwhelming webpages into calm, focused, and personalized reading experiences.

This project was developed as a high-fidelity prototype for a hackathon.

## ✨ Features
**ADHD Focus Mode:** Instantly declutters any webpage into a clean, single-column, distraction-free format.

**Dyslexia Friendly Mode:** Applies the OpenDyslexic font and adds an interactive "reading ruler" that follows the mouse to aid focus.

**Customizable Sensory Themes:** A suite of visual themes (like Smart Dark and Low Blue Light) to reduce sensory overload, with built-in protection for informational images.

**AI-Powered TL;DR Summaries:** Generates concise summaries of long articles on-demand using the Google Gemini AI.

**AI-Powered Explanations:** Allows users to highlight any word or phrase and get a simple explanation via a right-click menu.

**Text-to-Speech:** Reads any highlighted text aloud with pause, resume, and stop controls, accessible via the right-click menu and popup.

**Persistent Settings:** Remembers your preferred modes and themes across different websites and browsing sessions.

## 🛠️ Tech Stack
**Frontend:** Browser Extension (Vanilla JavaScript, HTML, CSS) for Chromium-based browsers (Chrome, Brave, etc.)

**Backend:** Node.js with Express

**AI:** Google Gemini API

**Storage:** chrome.storage API

## 🚀 Getting Started
To get this project running on your local machine, follow these steps.

### Prerequisites
**Node.js:** Make sure you have Node.js installed. You can download it from nodejs.org.

**Git:** You'll need Git to clone the repository.

**A Chromium-based Browser:** Google Chrome, Brave, Microsoft Edge, etc.

### Installation & Setup
1. **Clone the Repository**
Open your terminal and run the following command:

git clone [https://github.com/itsmyra1006/Attune.git](https://github.com/itsmyra1006/Attune.git)
cd Attune

2. **Set Up the Backend Server**
The server handles all the AI-powered features.
```bash
# Navigate to the server directory
cd attune-server

# Install the required packages
npm install

# Get your AI API Key
# Go to Google AI Studio ([https://aistudio.google.com/](https://aistudio.google.com/)) to get a free API key.

# Add your API Key
# Open the `server.js` file in a code editor and paste your API key into the placeholder:
# const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");

# Run the server
node server.js
```
Your terminal should now say Attune server listening at http://localhost:3000. Keep this terminal window open.

3. **Set Up the Frontend Extension**

Open your Chromium-based browser (e.g., Chrome).

Navigate to the extensions page by typing chrome://extensions (or brave://extensions) in your address bar.

Enable Developer mode using the toggle switch in the top-right corner.

Click the "Load unpacked" button.

Select the attune-extension folder from the cloned repository.

The Attune icon should now appear in your browser's toolbar, and the extension is ready to use!

## Usage
Navigate to any webpage.

Click the Attune icon in your browser toolbar to open the control popup.

Select any of the modes (ADHD Focus, Dyslexia Friendly, Sensory Themes) to instantly transform the page.

Click "Generate TL;DR" to get an AI-powered summary of the page's content.

Highlight any text on the page, right-click, and select "Attune: Explain This" or "Attune: Read Aloud".