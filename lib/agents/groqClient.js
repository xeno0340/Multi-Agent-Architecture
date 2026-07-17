// Shared helper — every agent imports this to talk to Groq.
// Nobody else needs to touch this file once it's created.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callGroq({ system, prompt, temperature, max_tokens }) {
  const maxRetries = 2;
  const retryDelays = [500, 1000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: temperature ?? 0.7,
          max_tokens: max_tokens || 1024,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
        }),
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();

        if (
          attempt < maxRetries &&
          [429, 500, 502, 503, 504].includes(res.status)
        ) {
          await delay(retryDelays[attempt]);
          continue;
        }

        throw new Error(
          `Groq API request failed (${res.status}). Please try again later.`
        );
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(
          "Groq returned no content. Check your API key and model."
        );
      }

      return text;
    } catch (err) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        if (attempt < maxRetries) {
          await delay(retryDelays[attempt]);
          continue;
        }

        throw new Error(
          "Request timed out — Groq API is slow, please try again."
        );
      }

      if (attempt < maxRetries) {
        await delay(retryDelays[attempt]);
        continue;
      }

      throw new Error(
        `Unable to contact the Groq API after multiple attempts. ${err.message}`
      );
    }
  }
}

export function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in model output");
  return JSON.parse(match[0]);
}