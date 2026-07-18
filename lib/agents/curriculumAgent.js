import { callGroq, extractJson } from "./groqClient";

// The "Curriculum Planner" — for broad topics, breaks them into an ordered
// sequence of smaller sub-topics, and picks which one is most relevant to
// teach first, given the learner's context and history.

export async function runCurriculumAgent(topic, learnerContext, board, priorHistory) {
  const system = `You are the Curriculum Agent. Given a topic that may be broad
(e.g. "Python", "World War 2", "Algebra"), break it into an ordered sequence of
3-5 smaller, teachable sub-topics — the natural order a good teacher would
cover them in. Then, based on the learner's context and any prior history,
pick which ONE sub-topic is the most relevant to teach right now.
Respond ONLY with a JSON object:
{
  "sequence": ["sub-topic 1", "sub-topic 2", "sub-topic 3"],
  "focus_subtopic": "the one sub-topic to teach right now",
  "reasoning": "one sentence on why this sub-topic was chosen first for this learner"
}`;

  const priorSummary =
    priorHistory && priorHistory.length > 0
      ? priorHistory.slice(-5).map((h) => `${h.topic} (${h.feedback})`).join(", ")
      : "none";

  const prompt = `Topic: ${topic}
Learner context: ${learnerContext}
Board/Class: ${board || "general"}
Learner's prior history: ${priorSummary}`;

  const raw = await callGroq({ system, prompt, temperature: 0.3, max_tokens: 500 });
  return extractJson(raw);
}