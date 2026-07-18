import { callGroq, extractJson } from "./groqClient";

// The "Grader" — takes the questions (with their rubrics) and the learner's
// actual typed answers, scores each one, and produces an overall assessed
// performance level. This is what makes adaptation REAL — driven by actual
// answer quality, not a self-reported button click.

export async function runGradingAgent(topic, questions, answers) {
  const system = `You are the Grading Agent. You are given a list of practice
questions (each with a weighted rubric) and a learner's typed answers to each.
Score each answer against its rubric, out of 100. Then produce an overall
assessment: the learner's demonstrated level (beginner | intermediate | advanced)
based on actual performance — this may be lower or higher than the difficulty
the questions were originally set at, if their answers show it.
Respond ONLY with a JSON object:
{
  "question_scores": [
    {"score": 85, "feedback": "short, specific feedback on this answer"}
  ],
  "overall_score": 78,
  "demonstrated_level": "intermediate",
  "summary": "one or two sentences on what the learner did well and what to work on next"
}
The question_scores array must have exactly one entry per question, in the same order.`;

  const qaPairs = questions
    .map(
      (q, i) =>
        `Question ${i + 1}: ${q.question}\nRubric: ${q.rubric
          .map((r) => `${r.criterion} (${r.weight_percent}%)`)
          .join(", ")}\nLearner's answer: ${answers[i] || "(no answer given)"}`
    )
    .join("\n\n");

  const prompt = `Topic: ${topic}\n\n${qaPairs}`;

  const raw = await callGroq({ system, prompt, temperature: 0.2, max_tokens: 900 });
  return extractJson(raw);
}