import { runGradingAgent } from "../../lib/agents/gradingAgent";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, questions, answers } = req.body || {};
  if (!topic || !questions || !answers) {
    return res.status(400).json({ error: "'topic', 'questions', and 'answers' are all required." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY." });
  }

  try {
    const grading = await runGradingAgent(topic, questions, answers);
    return res.status(200).json({ grading });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Something went wrong grading the answers." });
  }
}