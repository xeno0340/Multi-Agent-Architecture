import { callGroq, extractJson } from "./groqClient";

// The "Quiz Maker" — writes practice questions + grading rubric.
// This is the ONLY file that defines the Assessment Agent's logic.

export async function runAssessmentAgent(topic, calibration, board) {
  const system = `You are the Assessment Agent. You generate practice questions calibrated
to the given learner profile and curriculum board/class, along with a weighted grading
rubric for each question. Be precise and consistent. Respond ONLY with a JSON object:
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
Board/Class: ${board || "general"}
Learner level description: ${calibration.level_description}
Difficulty: ${calibration.difficulty}`;

  const raw = await callGroq({ system, prompt, temperature: 0.2, max_tokens: 900 });
  return extractJson(raw);
}