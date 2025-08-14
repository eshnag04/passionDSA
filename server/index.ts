import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

app.post('/api/explain', async (req, res) => {
  try {
    const { interest, concept } = req.body ?? {};
    if (!interest || !concept) return res.status(400).json({ error: 'Missing interest or concept' });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Explain CS topics in the user’s passion language. Keep TypeScript idiomatic.' },
        { role: 'user', content: `Explain "${concept}" for someone into "${interest}". Return ONLY JSON with keys: analogy (2–4 sentences), steps (3–6 items), code (TypeScript).` },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content!;
    const data = JSON.parse(content); // { analogy, steps, code }
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
});

app.listen(8787, () => console.log('API http://localhost:8787'));
