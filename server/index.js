import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from './secretManager.js';
import { requireAuth } from './authMiddleware.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
].filter(Boolean);

async function callWithModelFallback(genAI, modelOptions, callback) {
  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ ...modelOptions, model: modelName });
      return await callback(model, modelName);
    } catch (err) {
      console.warn(`[Gemini API] Failed with model ${modelName}:`, err.message);
      lastError = err;
      if (err.message && (err.message.includes('not found') || err.message.includes('404') || err.message.includes('is not supported') || err.message.includes('unknown model'))) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), candidateModels: CANDIDATE_MODELS });
});

/**
 * Multi-Turn AI Journaling Conversation Endpoint
 */
app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or empty messages array' });
    }

    const apiKey = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    // Format chat history (exclude last message which is user prompt)
    let historyMessages = messages.slice(0, -1);
    const firstUserIdx = historyMessages.findIndex(m => m.role === 'user');
    if (firstUserIdx > 0) {
      historyMessages = historyMessages.slice(firstUserIdx);
    } else if (firstUserIdx === -1) {
      historyMessages = [];
    }

    const history = historyMessages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    const reply = await callWithModelFallback(
      genAI,
      {
        systemInstruction: `You are an empathetic, insightful, and supportive AI Journaling Partner. 
Your purpose is to help the user unpack their thoughts, explore feelings, brainstorm ideas, and gain clarity.
Keep responses thoughtful, warm, concise, and focused on self-discovery. Ask insightful open-ended follow-up questions.`
      },
      async (model) => {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        return response.text();
      }
    );

    res.json({ reply });
  } catch (error) {
    console.error('[Chat Error]:', error);
    res.status(500).json({ error: 'Failed to generate chat response', details: error.message });
  }
});

/**
 * Automated Journal Summarization Endpoint
 */
app.post('/api/summarize', requireAuth, async (req, res) => {
  try {
    const { journalContent, chatHistory } = req.body;

    if (!journalContent && (!chatHistory || chatHistory.length === 0)) {
      return res.status(400).json({ error: 'No content provided to summarize' });
    }

    const apiKey = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const chatContext = Array.isArray(chatHistory)
      ? chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
      : '';

    const prompt = `Analyze the following personal journal entry and conversation log.
Generate a structured JSON response with:
1. "title": A concise, evocative title for this journal entry (maximum 6 words).
2. "summary": Exactly 3 concise bullet points summarizing the core themes and thoughts.
3. "keyInsights": 2-3 deep personal insights or observations.
4. "actionItems": 2 actionable next steps or gentle intentions.

Respond strictly in valid JSON matching this schema:
{
  "title": "string",
  "summary": ["string", "string", "string"],
  "keyInsights": ["string", "string"],
  "actionItems": ["string", "string"]
}

---
JOURNAL ENTRY:
${journalContent || '(No independent notes)'}

CONVERSATION LOG:
${chatContext || '(No chat log)'}
`;

    const text = await callWithModelFallback(
      genAI,
      { generationConfig: { responseMimeType: 'application/json' } },
      async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
    );

    let resultJson;
    try {
      resultJson = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleaned);
    }

    res.json(resultJson);
  } catch (error) {
    console.error('[Summarize Error]:', error);
    res.status(500).json({ error: 'Failed to summarize journal entry', details: error.message });
  }
});

/**
 * Phase 3 Original Feature Enhancement: Cognitive Clarity & Mood Analytics Engine
 */
app.post('/api/cognitive-insights', requireAuth, async (req, res) => {
  try {
    const { journalContent } = req.body;
    if (!journalContent || journalContent.trim().length < 10) {
      return res.status(400).json({ error: 'Journal content too short for analysis' });
    }

    const apiKey = await getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `You are an expert cognitive behavioral wellness coach.
Analyze the following personal journal reflection:
"${journalContent}"

Extract cognitive wellness indicators and return ONLY valid JSON matching this schema:
{
  "primaryMood": "string (e.g. Reflective, Energized, Anxious, Grateful, Overwhelmed, Focused)",
  "moodScore": number (1 to 10, where 1 is very distressed and 10 is thriving/peaceful),
  "cognitivePattern": {
    "detected": boolean,
    "patternName": "string (e.g. Catastrophizing, All-or-Nothing Thinking, Mind Reading, or 'Balanced Perspective')",
    "reframe": "string (A compassionate, evidence-based alternative perspective)"
  },
  "microHabit": "string (One simple, 2-minute restorative action the user can do today)",
  "coreGratitude": "string (One implicit or explicit positive anchor identified in their writing)"
}
`;

    const text = await callWithModelFallback(
      genAI,
      { generationConfig: { responseMimeType: 'application/json' } },
      async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      }
    );

    let resultJson;
    try {
      resultJson = JSON.parse(text);
    } catch {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleaned);
    }

    res.json(resultJson);
  } catch (error) {
    console.error('[Cognitive Insights Error]:', error);
    res.status(500).json({ error: 'Failed to generate cognitive insights', details: error.message });
  }
});

// Serve frontend in production container
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Personal Gemini Journal] Running on port ${PORT}`);
  console.log(`[Model] Candidate models: ${CANDIDATE_MODELS.join(', ')}`);
  console.log(`[Security] Cloud Secret Manager integration ready`);
  console.log(`[Auth] Firebase token verification active`);
});
