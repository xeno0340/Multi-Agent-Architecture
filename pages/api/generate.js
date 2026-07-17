// /api/generate
// Orchestrator: decides which agent(s) to invoke based on the actual input,
// then calls the Content Agent and/or Assessment Agent with structured,
// level-calibrated instructions. The plan is generated per-request, not
// hardcoded — that's what makes this real multi-agent orchestration.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

async function callGroq({ system, prompt, temperature, max_tokens }) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned no content — check your API key and model name.");
  return text;
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in model output");
  return JSON.parse(match[0]);
}

// --- Orchestrator ---
async function runOrchestrator(topic, learnerContext) {
  const system = `You are the orchestrator for a personalized learning platform.
Given a topic and a description of the learner, decide:
1. Which agents are needed: "content" (an explanation), "assessment" (practice questions), or both.
2. A short calibration profile describing the exact depth, tone, and example style to use for this learner.
Respond ONLY with a JSON object in this exact shape:
{
  "agents_needed": ["content", "assessment"],
  "calibration": {
    "level_description": "...",
    "tone": "...",
    "example_style": "...",
    "difficulty": "beginner | intermediate | advanced"
  },
  "reasoning": "one sentence on why these agents and this calibration were chosen"
}`;

  const prompt = `Topic: ${topic}\nLearner context: ${learnerContext}`;
  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 500 });
  return extractJson(raw);
}

// --- Content Agent ---
async function runContentAgent(topic, calibration) {
  const system = `You are the Content Agent. You write clear explanations of a topic,
calibrated EXACTLY to the given learner profile. Use the specified tone, example style,
and difficulty level. Do not exceed the appropriate depth for this learner.
Respond ONLY with a JSON object:
{
  "explanation": "the full explanation, using plain paragraphs",
  "key_examples": ["example 1", "example 2"]
}`;

  const prompt = `Topic: ${topic}
Learner level description: ${calibration.level_description}
Tone: ${calibration.tone}
Example style: ${calibration.example_style}
Difficulty: ${calibration.difficulty}`;

  const raw = await callGroq({ system, prompt, temperature: 0.6, max_tokens: 900 });
  return extractJson(raw);
}

// --- Assessment Agent ---
async function runAssessmentAgent(topic, calibration) {
  const system = `You are the Assessment Agent. You generate practice questions calibrated
to the given learner profile, along with a weighted grading rubric for each question.
Be precise and consistent. Respond ONLY with a JSON object:
{
  "questions": [
    {
      "question": "...",
      "difficulty": "beginner | intermediate | advanced",
      "rubric": [
        {"criterion": "...", "weight_percent": 50},
        {"criterion": "...", "weight_percent": 50}
      ]
    }
  ]
}
Generate exactly 3 questions, difficulty matching the calibration profile provided.`;

  const prompt = `Topic: ${topic}
Learner level description: ${calibration.level_description}
Difficulty: ${calibration.difficulty}`;

  const raw = await callGroq({ system, prompt, temperature: 0.2, max_tokens: 900 });
  return extractJson(raw);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, learnerContext } = req.body || {};
  if (!topic || !learnerContext) {
    return res.status(400).json({ error: "Both 'topic' and 'learnerContext' are required." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Set it in your deployment's environment variables." });
  }

  try {
    const plan = await runOrchestrator(topic, learnerContext);

    const results = {};
    if (plan.agents_needed?.includes("content")) {
      results.content = await runContentAgent(topic, plan.calibration);
    }
    if (plan.agents_needed?.includes("assessment")) {
      results.assessment = await runAssessmentAgent(topic, plan.calibration);
    }

    return res.status(200).json({ plan, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Something went wrong generating the response." });
  }
}