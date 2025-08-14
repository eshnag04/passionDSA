require('dotenv').config();
const express = require('express');
const OpenAI = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// simple cache to avoid repeated calls
const cache = new Map();

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/explain', async (req, res) => {
  try {
    const { interest, concept } = req.body ?? {};
    if (!interest || !concept) return res.status(400).json({ error: 'Missing interest or concept' });

    const key = `${interest}:${concept}`;
    if (cache.has(key)) return res.json(cache.get(key));

    // Mock mode (no API needed)
    if (process.env.MOCK_AI === '1' || !process.env.OPENAI_API_KEY) {
      const mock = {
        source: 'mock',
        analogy: `(${interest}) ${concept} explained (mock).`,
        steps: ['Step one', 'Step two', 'Step three'],
        code: `// mock ${concept}\nconsole.log('hello');`
      };
      cache.set(key, mock);
      return res.json(mock);
    }

    const messages = [
      { role: 'system', content: 'You are a concise CS tutor. Return ONLY a JSON object. No prose or code fences.' },
      { role: 'user', content:
`Explain "${concept}" to someone who loves "${interest}".
Return ONLY valid JSON with keys:
- "analogy": 2-4 sentences
- "steps": 3-6 short bullet points (array of strings)
- "code": a TypeScript snippet as a string` }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'Empty model response' });

    let data;
    try { data = JSON.parse(content); }
    catch { return res.status(502).json({ error: 'Invalid JSON from model' }); }

    const payload = { ...data, source: 'ai' };
    cache.set(key, payload);
    res.json(payload);
  } catch (err) {
    if (err?.status === 429 || err?.code === 'insufficient_quota') {
      return res.status(429).json({ error: 'AI rate limit/quota exceeded' });
    }
    console.error('[API ERROR]', err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
