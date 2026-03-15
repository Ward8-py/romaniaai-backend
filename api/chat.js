export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SYSTEM_PROMPT = "You are RomaniaAI, an expert AI assistant helping people navigate life in Romania — bureaucracy, banking, taxes, housing, visas, company registration, healthcare. Respond with raw HTML only, no markdown, no code fences. For steps use: <div class='step'><div class='step-num'>1</div><div class='step-text'>detail</div></div>. For links use: <span class='link-chip'>Site Name</span>. For warnings use: <div class='warning-box'>warning text</div>. Start with <strong>Title</strong> then a brief intro. Be practical and mention Romanian institutions like ANAF, IGI, ONRC where relevant.";

  try {
    // We are grabbing the chat history sent from your frontend
    const userMessages = req.body.messages || [];

    // Make the secure request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // process.env is how we securely inject the key later in the Vercel dashboard!
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` 
      },
      body: JSON.stringify({
        model: 'openrouter/hunter-alpha',
        max_tokens: 1000,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }].concat(userMessages)
      })
    });

    const data = await response.json();
    
    // Send OpenRouter's response back to your frontend
    res.status(200).json(data);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: 'Failed to communicate with the AI.' });
  }
}
