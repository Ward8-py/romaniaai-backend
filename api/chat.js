export default async function handler(req, res) {
  // 1. ADD CORS HEADERS - This allows your GitHub Pages frontend to talk to this Vercel backend
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows any domain to connect. You can restrict this to your GitHub Pages URL later if you want.
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. HANDLE PREFLIGHT REQUEST - Browsers send an 'OPTIONS' request first to check permissions
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. ONLY ALLOW POST REQUESTS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SYSTEM_PROMPT = "You are RomaniaAI, an expert AI assistant helping people navigate life in Romania — bureaucracy, banking, taxes, housing, visas, company registration, healthcare. Respond with raw HTML only, no markdown, no code fences. For steps use: <div class='step'><div class='step-num'>1</div><div class='step-text'>detail</div></div>. For links use: <span class='link-chip'>Site Name</span>. For warnings use: <div class='warning-box'>warning text</div>. Start with <strong>Title</strong> then a brief intro. Be practical and mention Romanian institutions like ANAF, IGI, ONRC where relevant.";

  try {
    const userMessages = req.body.messages || [];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` 
      },
      body: JSON.stringify({
        model: 'openrouter/hunter-alpha',
        max_tokens: 1000,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }].concat(userMessages)
      })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: 'Failed to communicate with the AI.' });
  }
}
