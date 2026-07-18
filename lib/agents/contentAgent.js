import { callGroq, extractJson } from "./groqClient";

// The "Explainer" — writes the calibrated explanation, generates a Mermaid
// diagram, AND now also generates a comparison table when the topic
// naturally involves comparing 2+ things (e.g. "recursion vs iteration",
// "encapsulation vs abstraction"). If the topic doesn't need a table,
// this field is left empty.

export async function runContentAgent(topic, calibration, board) {
  const system = `You are the Content Agent. You write clear explanations of a topic,
calibrated EXACTLY to the given learner profile, aligned to the specified curriculum
board/class where applicable. Use the specified tone, example style, and difficulty.

You ALSO generate a simple Mermaid.js flowchart diagram ("graph TD" syntax, 4-7 nodes,
no markdown code fences) representing the key process or structure of this topic.

ADDITIONALLY: if this topic naturally involves comparing 2 or more things (e.g.
concepts, methods, categories), generate a comparison table with 2-4 columns and
2-5 rows. If the topic does NOT need a comparison (it's a single standalone concept),
return an empty array for "table_rows" and leave "table_headers" empty.

Respond ONLY with a JSON object:
{
  "explanation": "the full explanation, using plain paragraphs",
  "key_examples": ["example 1", "example 2"],
  "diagram_mermaid": "graph TD\\n  A[...] --> B[...]",
  "table_headers": ["Aspect", "Option A", "Option B"],
  "table_rows": [
    ["Speed", "Fast", "Slower"],
    ["Memory usage", "Low", "High"]
  ]
}`;

  const prompt = `Topic: ${topic}
Board/Class: ${board || "general"}
Learner level description: ${calibration.level_description}
Tone: ${calibration.tone}
Example style: ${calibration.example_style}
Difficulty: ${calibration.difficulty}
Curriculum alignment note: ${calibration.curriculum_note || "general"}`;

  const raw = await callGroq({ system, prompt, temperature: 0.6, max_tokens: 1300 });
  return extractJson(raw);
}