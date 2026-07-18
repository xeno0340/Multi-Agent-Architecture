import { useState, useEffect } from "react";
import LearnerForm from "../components/LearnerForm";
import ResultsDisplay from "../components/ResultsDisplay";
import HistoryPanel from "../components/HistoryPanel";

const HISTORY_KEY_PREFIX = "learner-history:";

function loadHistory(learnerId) {
  if (!learnerId) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY_PREFIX + learnerId.trim().toLowerCase());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistoryEntry(learnerId, entry) {
  if (!learnerId) return;
  const key = HISTORY_KEY_PREFIX + learnerId.trim().toLowerCase();
  const existing = loadHistory(learnerId);
  const updated = [...existing, entry];
  localStorage.setItem(key, JSON.stringify(updated));
}

export default function Home() {
  const [learnerId, setLearnerId] = useState("");
  const [board, setBoard] = useState("");
  const [topic, setTopic] = useState("");
  const [learnerContext, setLearnerContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory(learnerId));
  }, [learnerId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    try {
      const priorHistory = loadHistory(learnerId);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, learnerContext, board, priorHistory }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGraded(entry) {
    saveHistoryEntry(learnerId, entry);
    setHistory(loadHistory(learnerId));
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Multi-Agent Personalized Learning — MVP</h1>
        <p style={styles.sub}>
          Enter a learner, a topic, and their context. The orchestrator decides
          which agents to invoke, aligns to the given curriculum board/class,
          and adapts based on the learner's real graded performance over time.
        </p>

        <LearnerForm
          learnerId={learnerId} setLearnerId={setLearnerId}
          board={board} setBoard={setBoard}
          topic={topic} setTopic={setTopic}
          learnerContext={learnerContext} setLearnerContext={setLearnerContext}
          loading={loading} onSubmit={handleSubmit}
        />

        <HistoryPanel learnerId={learnerId} history={history} />

        {error && <div style={styles.error}>{error}</div>}

        <ResultsDisplay
          data={data}
          learnerId={learnerId}
          topic={topic}
          onGraded={handleGraded}
        />
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#0f1115", color: "#e6e6e6", fontFamily: "system-ui, sans-serif", padding: "40px 16px" },
  container: { maxWidth: 720, margin: "0 auto" },
  h1: { fontSize: 26, marginBottom: 8 },
  sub: { color: "#a0a0a0", marginBottom: 24, lineHeight: 1.5 },
  error: { background: "#3a1a1a", color: "#ff8080", padding: 12, borderRadius: 8, marginBottom: 16 },
};