export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function sendToGroq(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === "paste_your_groq_key_here") {
    throw new Error("Groq API key not configured — set VITE_GROQ_API_KEY in .env");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 400,
      temperature: 0.7,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const err = await response.json();
      detail = err.error?.message || JSON.stringify(err);
    } catch {
      detail = response.statusText;
    }
    throw new Error(`Groq API error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
