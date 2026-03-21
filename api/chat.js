// api/chat.js — no SDK, no new dependencies, no crash
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SYSTEM_PROMPT = `You are RomaniaAI, an expert AI assistant helping people navigate life in Romania — bureaucracy, banking, taxes, housing, visas, company registration, healthcare. Respond with raw HTML only, no markdown, no code fences. For steps use: <div class='step'><div class='step-num'>1</div><div class='step-text'>detail</div></div>. For links use: <span class='link-chip'>Site Name</span>. For warnings use: <div class='warning-box'>warning text</div>. Start with <strong>Title</strong> then a brief intro. Be practical and mention Romanian institutions like ANAF, IGI, ONRC where relevant.`;

  const userMessages = req.body.messages || [];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-super-49b-v1:free', // ← only thing that changed
        max_tokens: 1000,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...userMessages]
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with the AI.' });
  }
}
