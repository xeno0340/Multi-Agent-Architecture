import { callGroq, extractJson } from "./groqClient";

// The "Explainer" — writes the calibrated explanation for a topic.
// This is the ONLY file that defines the Content Agent's logic.

export async function runContentAgent(topic, calibration, board) {
  const system = `You are the Content Agent. You write clear explanations of a topic,
calibrated EXACTLY to the given learner profile, aligned to the specified curriculum
board/class where applicable (use its typical terminology and scope). Use the specified
tone, example style, and difficulty level.
Respond ONLY with a JSON object:
{
  "explanation": "the full explanation, using plain paragraphs",
  "key_examples": ["example 1", "example 2"]
}`;

  const prompt = `Topic: ${topic}
Board/Class: ${board || "general"}
Learner level description: ${calibration.level_description}
Tone: ${calibration.tone}
Example style: ${calibration.example_style}
Difficulty: ${calibration.difficulty}
Curriculum alignment note: ${calibration.curriculum_note || "general"}`;

  const raw = await callGroq({ system, prompt, temperature: 0.6, max_tokens: 900 });
  return extractJson(raw);
}