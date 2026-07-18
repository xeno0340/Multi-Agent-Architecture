import { callGroq, extractJson } from "./groqClient";

// The "Quiz Maker" — generates multiple-choice practice questions.
// Temperature raised slightly so repeated identical requests still
// produce fresh questions instead of near-duplicates.

export async function runAssessmentAgent(topic, calibration, board) {
  const system = `You are the Assessment Agent. You generate multiple-choice
practice questions calibrated to the given learner profile and curriculum
board/class. Each question has exactly 4 options, only one of which is
correct. Make incorrect options plausible, not obviously wrong.
Respond ONLY with a JSON object:
{
  "questions": [
    {
      "question": "...",
      "difficulty": "beginner | intermediate | advanced",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0,
      "explanation": "one sentence on why the correct answer is right"
    }
  ]
}
Generate exactly 3 questions, difficulty matching the calibration profile provided.`;

  const prompt = `Topic: ${topic}
Board/Class: ${board || "general"}
Learner level description: ${calibration.level_description}
Difficulty: ${calibration.difficulty}`;

  const raw = await callGroq({ system, prompt, temperature: 0.5, max_tokens: 900 });
  return extractJson(raw);
}