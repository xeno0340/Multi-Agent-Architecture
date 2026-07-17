import { callGroq, extractJson } from "./groqClient";

// This is the "Manager" — decides which agents to call and how to
// calibrate them, factoring in curriculum board/class and the learner's
// prior history. This is the ONLY file that defines the orchestrator's logic.

function formatHistory(priorHistory) {
  if (!priorHistory || priorHistory.length === 0) {
    return "No prior history — this is the learner's first session.";
  }
  return priorHistory
    .slice(-5)
    .map(
      (h) =>
        `- Topic: "${h.topic}" (difficulty: ${h.difficulty}) — learner feedback: ${h.feedback}`
    )
    .join("\n");
}

export async function runOrchestrator(topic, learnerContext, board, priorHistory) {
  const system = `You are the orchestrator for a personalized learning platform.
Given a topic, a description of the learner, their curriculum board/class, and
their prior learning history, decide:
1. Which agents are needed: "content" (an explanation), "assessment" (practice questions), or both.
2. A calibration profile describing the exact depth, tone, and example style to use.
Use the prior history to adjust: if the learner struggled with a related/foundational
concept before, calibrate simpler and note the connection. If they've done well on
similar material, you can calibrate slightly harder.
Align terminology and scope to the given board/class where relevant (e.g. CBSE, ICSE,
a specific grade level) — use the vocabulary and depth typical for that curriculum.
Respond ONLY with a JSON object in this exact shape:
{
  "agents_needed": ["content", "assessment"],
  "calibration": {
    "level_description": "...",
    "tone": "...",
    "example_style": "...",
    "difficulty": "beginner | intermediate | advanced",
    "curriculum_note": "how this aligns to the given board/class, or 'general' if none given"
  },
  "reasoning": "one sentence on why these agents, this calibration, and any adjustment made based on prior history"
}`;

  const prompt = `Topic: ${topic}
Learner context: ${learnerContext}
Board/Class: ${board || "Not specified — use general school-level curriculum"}

Learner's prior history:
${formatHistory(priorHistory)}`;

  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 600 });
  return extractJson(raw);
}