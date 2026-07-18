import { callGroq, extractJson } from "./groqClient";

// This is the "Manager" — decides which agents to call and how to
// calibrate them.
//
// Rule: on a learner's FIRST session (no prior history), trust their
// self-described level/goal directly. Once real quiz-graded history
// exists, that becomes the source of truth and overrides self-description
// if they conflict.

function formatHistory(priorHistory) {
  if (!priorHistory || priorHistory.length === 0) {
    return "NONE — this is the learner's first session.";
  }
  return priorHistory
    .slice(-5)
    .map(
      (h) =>
        `- Topic: "${h.topic}" (difficulty attempted: ${h.difficulty}) — result: ${h.feedback}`
    )
    .join("\n");
}

export async function runOrchestrator(topic, learnerContext, board, priorHistory) {
  const hasHistory = priorHistory && priorHistory.length > 0;

  const system = `You are the orchestrator for a personalized learning platform.
Given a topic, a description of the learner, their curriculum board/class, and
their prior learning history, decide:
1. Is this topic BROAD (many distinct sub-concepts, e.g. "Python") or NARROW
   (a single focused concept, e.g. "recursion")? If BROAD, include
   "curriculum" in agents_needed. If NARROW, do not.
2. Which agents are needed overall: "curriculum" (if broad), "content", "assessment".
3. A calibration profile: depth, tone, example style, difficulty.

CRITICAL RULE ON TRUST:
- If prior history is NONE (first session for this learner): trust the
  learner's self-described context directly. If they say they want an
  advanced/harder level, calibrate to that — do not default conservative.
- If prior history EXISTS: it reflects real, quiz-graded performance, which
  is stronger evidence than self-description. If it conflicts with what the
  learner claims about themselves this time, trust the real history and
  calibrate accordingly — explain this override explicitly in your reasoning.

Align terminology to the given board/class where relevant.
Respond ONLY with a JSON object in this exact shape:
{
  "is_broad_topic": true,
  "agents_needed": ["curriculum", "content", "assessment"],
  "calibration": {
    "level_description": "...",
    "tone": "...",
    "example_style": "...",
    "difficulty": "beginner | intermediate | advanced",
    "curriculum_note": "how this aligns to the given board/class, or 'general' if none given"
  },
  "reasoning": "one sentence explaining the broad/narrow decision, and explicitly state whether this was based on the learner's self-description (first session) or on real prior performance (returning learner)"
}`;

  const prompt = `Topic: ${topic}
Learner context (self-described): ${learnerContext}
Board/Class: ${board || "Not specified — use general school-level curriculum"}

Learner's prior performance history: ${hasHistory ? "EXISTS — see below, trust this over self-description" : "NONE — trust the learner's self-description directly"}
${formatHistory(priorHistory)}`;

  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 600 });
  return extractJson(raw);
}