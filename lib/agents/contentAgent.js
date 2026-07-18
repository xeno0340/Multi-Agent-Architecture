import { callGroq, extractJson } from "./groqClient";

// The "Explainer" — writes the calibrated explanation, AND now also
// generates a Mermaid.js flowchart/diagram syntax string to visually
// represent the concept's structure or process.

export async function runContentAgent(topic, calibration, board) {
  const system = `You are the Content Agent. You write clear explanations of a topic,
calibrated EXACTLY to the given learner profile, aligned to the specified curriculum
board/class where applicable. Use the specified tone, example style, and difficulty.

You ALSO generate a simple Mermaid.js flowchart diagram (using "graph TD" syntax)
that visually represents the KEY PROCESS or STRUCTURE of this topic — e.g. steps in
an algorithm, stages of a process, or a concept hierarchy. Keep it to 4-7 nodes,
valid Mermaid syntax only, no markdown code fences around it.

Example of valid Mermaid syntax for the "diagram_mermaid" field:
graph TD
  A[Start] --> B[Check base case]
  B -->|Yes| C[Return result]
  B -->|No| D[Call function again with smaller input]
  D --> B

Respond ONLY with a JSON object:
{
  "explanation": "the full explanation, using plain paragraphs",
  "key_examples": ["example 1", "example 2"],
  "diagram_mermaid": "graph TD\\n  A[...] --> B[...]"
}`;

  const prompt = `Topic: ${topic}
Board/Class: ${board || "general"}
Learner level description: ${calibration.level_description}
Tone: ${calibration.tone}
Example style: ${calibration.example_style}
Difficulty: ${calibration.difficulty}
Curriculum alignment note: ${calibration.curriculum_note || "general"}`;

  const raw = await callGroq({ system, prompt, temperature: 0.6, max_tokens: 1100 });
  return extractJson(raw);
}