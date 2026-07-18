import { useState, useEffect } from "react";
import LearnerForm from "../components/LearnerForm";
import ResultsDisplay from "../components/ResultsDisplay";
import HistoryPanel from "../components/HistoryPanel";
import { colors, fonts, tint } from "../lib/theme";

const HISTORY_KEY_PREFIX = "learner-history:";
const MAX_HISTORY_ENTRIES = 20;

const AGENT_ROSTER = [
  { key: "orchestrator", label: "Orchestrator", role: "Decides which agents run" },
  { key: "curriculum", label: "Curriculum", role: "Sequences broad topics" },
  { key: "content", label: "Content", role: "Writes calibrated explanations" },
  { key: "storytelling", label: "Storytelling", role: "Reframes as narrative" },
  { key: "assessment", label: "Assessment", role: "Grades & adapts difficulty" },
];

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
  const updated = [...existing, entry].slice(-MAX_HISTORY_ENTRIES);
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

  const activeAgents = data ? ["orchestrator", ...(data.plan.agents_needed || [])] : [];

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.logoRow}>
            <div style={styles.logoMark}>MA</div>
            <span style={styles.logoText}>MULTI-AGENT LEARNING</span>
          </div>

          <p style={styles.sidebarBlurb}>
            One request, coordinated across a team of specialist AI agents —
            decided dynamically per request, not a fixed pipeline.
          </p>

          <div style={styles.rosterLabel}>AGENT ROSTER</div>
          <div style={styles.rosterList}>
            {AGENT_ROSTER.map((a) => {
              const active = activeAgents.includes(a.key);
              const c = colors[a.key];
              return (
                <div
                  key={a.key}
                  style={{
                    ...styles.rosterItem,
                    background: active ? tint(c, 0.12) : "transparent",
                    border: `1px solid ${active ? tint(c, 0.4) : "transparent"}`,
                  }}
                >
                  <span style={{ ...styles.rosterDot, background: c, opacity: active ? 1 : 0.35 }} />
                  <div>
                    <div style={{ ...styles.rosterName, color: active ? c : colors.textSecondary }}>
                      {a.label}
                    </div>
                    <div style={styles.rosterRole}>{a.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main style={styles.main}>
          <header style={styles.header}>
            <h1 style={styles.h1}>A team of AI specialists, coordinated for every learner</h1>
            <p style={styles.sub}>
              The orchestrator decides which agents to invoke, aligns to your curriculum
              board, and adapts to real graded performance over time — not self-reported
              guesses.
            </p>
          </header>

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
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  },
  shell: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    gap: 32,
    padding: "40px 24px 100px",
    alignItems: "start",
  },
  sidebar: {
    position: "sticky",
    top: 40,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: colors.orchestrator,
    color: "#0d0e14",
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    lineHeight: 1.3,
  },
  sidebarBlurb: {
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.textSecondary,
  },
  rosterLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginTop: 4,
  },
  rosterList: { display: "flex", flexDirection: "column", gap: 6 },
  rosterItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    transition: "background 0.2s ease",
  },
  rosterDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginTop: 5,
    flexShrink: 0,
  },
  rosterName: { fontFamily: fonts.display, fontSize: 13, fontWeight: 700 },
  rosterRole: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  main: { minWidth: 0 },
  header: { marginBottom: 28 },
  h1: {
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.25,
    margin: "0 0 10px",
  },
  sub: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    maxWidth: 560,
  },
  error: {
    background: colors.errorBg,
    color: colors.error,
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
};