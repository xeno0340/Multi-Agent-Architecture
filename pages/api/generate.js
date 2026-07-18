import { runOrchestrator } from "../../lib/agents/orchestrator";
import { runCurriculumAgent } from "../../lib/agents/curriculumAgent";
import { runContentAgent } from "../../lib/agents/contentAgent";
import { runAssessmentAgent } from "../../lib/agents/assessmentAgent";
import { runStorytellingAgent } from "../../lib/agents/storytellingAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, learnerContext, board, priorHistory } = req.body || {};
  if (!topic || !learnerContext) {
    return res.status(400).json({ error: "Both 'topic' and 'learnerContext' are required." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Set it in your deployment's environment variables." });
  }

  try {
    const plan = await runOrchestrator(topic, learnerContext, board, priorHistory);

    let curriculum = null;
    let focusTopic = topic;

    if (plan.agents_needed?.includes("curriculum")) {
      curriculum = await runCurriculumAgent(topic, learnerContext, board, priorHistory);
      focusTopic = curriculum.focus_subtopic || topic;
    }

    const results = {};
    if (plan.agents_needed?.includes("content")) {
      results.content = await runContentAgent(focusTopic, plan.calibration, board);
    }
    if (plan.agents_needed?.includes("assessment")) {
      results.assessment = await runAssessmentAgent(focusTopic, plan.calibration, board);
    }
    if (plan.agents_needed?.includes("storytelling") && results.content?.explanation) {
      results.storytelling = await runStorytellingAgent(
        focusTopic,
        results.content.explanation,
        plan.calibration
      );
    }

    return res.status(200).json({ plan, curriculum, focusTopic, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Something went wrong generating the response." });
  }
}