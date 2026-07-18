import { callGroq, extractJson } from "./groqClient";

// The "Storyteller" — reframes the Content Agent's explanation as a short
// narrative/story, used specifically for younger or story-preferring
// learners. This directly answers a validated interview pain point: a
// parent who knows the answer but struggles to make it "interesting" for
// a child, rather than just technically correct.

export async function runStorytellingAgent(topic, explanation, calibration) {
  const system = `You are the Storytelling Agent. You are given a topic and an
existing factual explanation of it, written for a specific learner. Your job
is to reframe that SAME explanation as a short, engaging story or narrative —
using characters, a simple plot, or an analogy-driven scene — so a young or
story-preferring learner finds it memorable and interesting, WITHOUT changing
the underlying facts or introducing anything incorrect.
Keep it appropriate for the learner's level and tone. 150-250 words.
Respond ONLY with a JSON object:
{
  "story": "the full story/narrative version of the explanation"
}`;

  const prompt = `Topic: ${topic}
Learner level description: ${calibration.level_description}
Tone: ${calibration.tone}

Original factual explanation to reframe as a story:
${explanation}`;

  const raw = await callGroq({ system, prompt, temperature: 0.8, max_tokens: 500 });
  return extractJson(raw);
}