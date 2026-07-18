import { callGroq, extractJson } from "./groqClient";

// This is the "Manager" — decides which agents to call and how to
// calibrate them.
//
// Rule: on a learner's FIRST session (no prior history), trust their
// self-described level/goal directly. Once real quiz-graded history
// exists, that becomes the source of truth and overrides self-description
// if they conflict.
//
// Also now decides whether "storytelling" is needed — for young learners,
// or learners whose context suggests they'd benefit from a narrative/story
// framing rather than a purely technical explanation.

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
  const system = `You are the orchestrator for a personalized learning platform.
Given a topic, a description of the learner, their curriculum board/class, and
their prior learning history, decide:
1. Is this topic BROAD (many distinct sub-concepts, e.g. "Python") or NARROW
   (a single focused concept, e.g. "recursion")? If BROAD, include
   "curriculum" in agents_needed. If NARROW, do not.
2. Should "storytelling" be included? Include it if the learner context
   suggests a young learner (e.g. mentions a specific young grade/age, or
   a parent helping a child), OR if the context explicitly suggests they'd
   engage better with a narrative/story framing rather than a dry technical
   explanation. Do NOT include it for adult/professional/exam-focused
   contexts unless they ask for it.
3. Which agents are needed overall: "curriculum" (if broad), "content",
   "assessment", "storytelling" (if appropriate per rule above).
4. A calibration profile: depth, tone, example style, difficulty.

CRITICAL RULE ON TRUST:
- If prior history is NONE (first session for this learner): trust the
  learner's self-described context directly.
- If prior history EXISTS: it reflects real, quiz-graded performance, which
  is stronger evidence than self-description. If it conflicts with what the
  learner claims about themselves this time, trust the real history.

Align terminology to the given board/class where relevant.
Respond ONLY with a JSON object in this exact shape:
{
  "is_broad_topic": true,
  "agents_needed": ["curriculum", "content", "assessment", "storytelling"],
  "calibration": {
    "level_description": "...",
    "tone": "...",
    "example_style": "...",
    "difficulty": "beginner | intermediate | advanced",
    "curriculum_note": "how this aligns to the given board/class, or 'general' if none given"
  },
  "reasoning": "one sentence explaining the broad/narrow decision, whether storytelling was included and why, and whether calibration came from self-description or real history"
}`;

  const prompt = `Topic: ${topic}
Learner context (self-described): ${learnerContext}
Board/Class: ${board || "Not specified — use general school-level curriculum"}

Learner's prior performance history: ${priorHistory && priorHistory.length > 0 ? "EXISTS — see below, trust this over self-description" : "NONE — trust the learner's self-description directly"}
${formatHistory(priorHistory)}`;

  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 600 });
  return extractJson(raw);
}