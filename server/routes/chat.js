import { Router } from 'express';
import { SYSTEM_PROMPT, localAnswer } from '../profile.js';

const router = Router();

async function askGemini(message, history) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const contents = [
    ...history.map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const data = await r.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim();
  if (!text) throw new Error('Empty Gemini reply');
  return text;
}

router.post('/chat', async (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  if (!message || message.length > 500) return res.status(400).json({ error: 'Ask a question of up to 500 characters.' });

  const history = (Array.isArray(req.body?.history) ? req.body.history : [])
    .slice(-8)
    .filter((h) => h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'model'))
    .map((h) => ({ role: h.role, text: h.text.slice(0, 800) }));

  if (process.env.GEMINI_API_KEY) {
    try {
      return res.json({ reply: await askGemini(message, history), source: 'gemini' });
    } catch (err) {
      console.error('Gemini failed, using local answers:', err.message);
    }
  }
  res.json({ reply: localAnswer(message), source: 'local' });
});

export default router;
