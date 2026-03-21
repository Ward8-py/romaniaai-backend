// api/chat.js (or whatever your handler file is called)
import OpenRouter from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are RomaniaAI, an expert AI assistant helping people navigate life in Romania — bureaucracy, banking, taxes, housing, visas, company registration, healthcare. Respond with raw HTML only, no markdown, no code fences. For steps use: <div class='step'><div class='step-num'>1</div><div class='step-text'>detail</div></div>. For links use: <span class='link-chip'>Site Name</span>. For warnings use: <div class='warning-box'>warning text</div>. Start with <strong>Title</strong> then a brief intro. Be practical and mention Romanian institutions like ANAF, IGI, ONRC where relevant.`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const userMessages = req.body.messages || [];

  try {
    const stream = await openrouter.chat.send({
      model: "nvidia/nemotron-super-49b-v1:free", // or nemotron-3-super-120b-a12b:free
      max_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...userMessages,
      ],
      stream: true,
    });

    // Collect the full streamed response server-side
    let fullContent = "";
    let reasoningTokens = null;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) fullContent += content;
      if (chunk.usage?.reasoningTokens) reasoningTokens = chunk.usage.reasoningTokens;
    }

    // Return in the same shape as the OpenRouter REST response
    // so your frontend doesn't need to change
    res.status(200).json({
      choices: [
        {
          message: {
            role: "assistant",
            content: fullContent,
          },
        },
      ],
      usage: reasoningTokens ? { reasoningTokens } : undefined,
    });

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to communicate with the AI." });
  }
}
