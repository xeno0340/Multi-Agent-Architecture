import { callGroq, extractJson } from "./groqClient";

// This is the "Manager" — decides which agents to call and how to
// calibrate them. Prior REAL quiz performance takes priority over
// what the learner claims about themselves, when they conflict.

function formatHistory(priorHistory) {
  if (!priorHistory || priorHistory.length === 0) {
    return "No prior history — this is the learner's first session.";
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
  const system = `You are the orchestrator for a personalized learning platform.
Given a topic, a description of the learner, their curriculum board/class, and
their prior learning history, decide:
1. Is this topic BROAD (many distinct sub-concepts, e.g. "Python") or NARROW
   (a single focused concept, e.g. "recursion")? If BROAD, include
   "curriculum" in agents_needed. If NARROW, do not.
2. Which agents are needed overall: "curriculum" (if broad), "content", "assessment".
3. A calibration profile: depth, tone, example style, difficulty.

IMPORTANT — prior history reflects ACTUAL quiz-graded performance, not a
self-report. This is real evidence of the learner's true level. If the
learner's stated context claims a level (e.g. "wants to go advanced") that
CONFLICTS with a recent low quiz score on a related topic, trust the quiz
score over the claim — calibrate to what they've actually demonstrated, and
say so explicitly in your reasoning. If prior scores were strong, you may
calibrate to their claimed level or slightly beyond it. If there's no
relevant prior history, go by their stated context.

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
  "reasoning": "one sentence explaining the broad/narrow decision, and explicitly note if real prior performance overrode the learner's self-described level"
}`;

  const prompt = `Topic: ${topic}
Learner context (self-described — may not be accurate): ${learnerContext}
Board/Class: ${board || "Not specified — use general school-level curriculum"}

Learner's ACTUAL prior performance history (trust this over self-description):
${formatHistory(priorHistory)}`;

  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 600 });
  return extractJson(raw);
}