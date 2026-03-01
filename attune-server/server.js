require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.get('/', (req, res) => {
  res.send('Attune server is alive and powered by Gemini! 👋');
});
app.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const wordCount = text.split(/\s+/).length;
    let lengthInstruction = "3 to 4 short bullet points";
    if (wordCount > 3000) {
      lengthInstruction = "3 distinct sections (with short bold headers) containing 2-3 brief bullet points each";
    } else if (wordCount > 1000) {
      lengthInstruction = "2 distinct sections (with short bold headers) containing 2-3 brief bullet points each";
    }

    const prompt = `You are an accessibility assistant for neurodivergent readers. Provide a 'TL;DR' summary for the following text. 
    The original text is roughly ${wordCount} words long. Your summary must be STRICTLY structured as: ${lengthInstruction}.
    
    RULES:
    1. NEVER write long paragraphs. 
    2. USE short, punchy bullet points (* or -) for everything.
    3. SEGREGATE different ideas using **Bold Headers**.
    4. Keep the vocabulary simple and easy to digest.
    
    Text to summarize: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ summary: response.text() });
  } catch (error) {
    console.error('Error with /summarize:', error);
    res.status(500).json({ error: 'Failed to summarize text.' });
  }
});
app.post('/explain', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    const prompt = `Explain the following concept or term in simple, easy-to-understand terms, as if for a beginner: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ explanation: response.text() });
  } catch (error) {
    console.error('Error with /explain:', error);
    res.status(500).json({ error: 'Failed to explain text.' });
  }
});
app.listen(port, () => {
  console.log(`Attune server listening at http://localhost:${port}`);
});