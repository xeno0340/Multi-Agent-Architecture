import { runOrchestrator } from "../../lib/agents/orchestrator";
import { runContentAgent } from "../../lib/agents/contentAgent";
import { runAssessmentAgent } from "../../lib/agents/assessmentAgent";

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

    const results = {};
    if (plan.agents_needed?.includes("content")) {
      results.content = await runContentAgent(topic, plan.calibration, board);
    }
    if (plan.agents_needed?.includes("assessment")) {
      results.assessment = await runAssessmentAgent(topic, plan.calibration, board);
    }

    return res.status(200).json({ plan, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Something went wrong generating the response." });
  }
}